const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../firebaseAdapter');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await db.findOne('users', u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Validate expected role if specified by the portal tab
  const { expectedRole } = req.body;
  if (expectedRole) {
    if (expectedRole === 'admin') {
      if (user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access Denied: Only the authorized institutional Administrator can access the Admin Panel.'
        });
      }
      // Enforce single admin restriction
      const allAdmins = await db.findMany('users', u => u.role === 'admin');
      if (allAdmins.length > 0 && allAdmins[0].id !== user.id) {
        return res.status(403).json({
          error: 'Security Policy: Only the primary designated College Administrator is authorized.'
        });
      }
    } else if (expectedRole === 'mentor') {
      if (user.role === 'student') {
        return res.status(403).json({
          error: 'Access Denied: Students are not authorized to access the Faculty Mentor Console.'
        });
      }
      if (user.role !== 'mentor') {
        return res.status(403).json({
          error: 'Access Denied: Account is not registered as a Faculty Mentor.'
        });
      }
    } else if (expectedRole === 'student') {
      if (user.role !== 'student') {
        return res.status(403).json({
          error: `Notice: This account is registered as a ${user.role}. Please sign in through your designated ${user.role} portal.`
        });
      }
    }
  }

  const token = generateToken(user);

  let studentProfile = null;
  let mentorProfile = null;

  if (user.role === 'student') {
    const student = await db.findOne('students', s => s.user_id === user.id);
    if (student) {
      let mentorName = 'Unassigned';
      if (student.assigned_mentor_id) {
        const mentor = await db.findOne('mentors', m => m.id === student.assigned_mentor_id);
        if (mentor) {
          const mentorUser = await db.findOne('users', u => u.id === mentor.user_id);
          if (mentorUser) mentorName = mentorUser.name;
        }
      }
      studentProfile = { ...student, mentor_name: mentorName };
    }
  } else if (user.role === 'mentor') {
    const mentor = await db.findOne('mentors', m => m.user_id === user.id);
    if (mentor) {
      const assignedCount = (await db.findMany('students', s => s.assigned_mentor_id === mentor.id)).length;
      mentorProfile = { ...mentor, student_count: assignedCount };
    }
  }

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url
    },
    student: studentProfile,
    mentor: mentorProfile
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  let studentProfile = null;
  let mentorProfile = null;

  if (req.user.role === 'student') {
    const student = await db.findOne('students', s => s.user_id === req.user.id);
    if (student) {
      let mentorName = 'Unassigned';
      if (student.assigned_mentor_id) {
        const mentor = await db.findOne('mentors', m => m.id === student.assigned_mentor_id);
        if (mentor) {
          const mentorUser = await db.findOne('users', u => u.id === mentor.user_id);
          if (mentorUser) mentorName = mentorUser.name;
        }
      }
      studentProfile = { ...student, mentor_name: mentorName };
    }
  } else if (req.user.role === 'mentor') {
    const mentor = await db.findOne('mentors', m => m.user_id === req.user.id);
    if (mentor) {
      const assignedCount = (await db.findMany('students', s => s.assigned_mentor_id === mentor.id)).length;
      mentorProfile = { ...mentor, student_count: assignedCount };
    }
  }

  res.json({
    user: req.user,
    student: studentProfile,
    mentor: mentorProfile
  });
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  const users = await db.findMany('users');
  const enrichedUsers = await Promise.all(users.map(async u => {
    let roll_number = null;
    let student_dept = null;
    let mentor_dept = null;
    let mentor_title = null;

    if (u.role === 'student') {
      const s = await db.findOne('students', item => item.user_id === u.id);
      if (s) {
        roll_number = s.roll_number;
        student_dept = s.department;
      }
    } else if (u.role === 'mentor') {
      const m = await db.findOne('mentors', item => item.user_id === u.id);
      if (m) {
        mentor_dept = m.department;
        mentor_title = m.title;
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar_url: u.avatar_url,
      roll_number,
      student_dept,
      mentor_dept,
      mentor_title
    };
  }));

  // Order by role: student, mentor, admin
  const roleWeights = { student: 1, mentor: 2, admin: 3 };
  enrichedUsers.sort((a, b) => (roleWeights[a.role] || 99) - (roleWeights[b.role] || 99));

  res.json({ users: enrichedUsers });
});

// POST /api/auth/demo-switch
router.post('/demo-switch', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const user = await db.findOne('users', u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found.' });
  }

  const token = generateToken(user);

  let studentProfile = null;
  let mentorProfile = null;

  if (user.role === 'student') {
    const student = await db.findOne('students', s => s.user_id === user.id);
    if (student) {
      let mentorName = 'Unassigned';
      if (student.assigned_mentor_id) {
        const mentor = await db.findOne('mentors', m => m.id === student.assigned_mentor_id);
        if (mentor) {
          const mentorUser = await db.findOne('users', u => u.id === mentor.user_id);
          if (mentorUser) mentorName = mentorUser.name;
        }
      }
      studentProfile = { ...student, mentor_name: mentorName };
    }
  } else if (user.role === 'mentor') {
    const mentor = await db.findOne('mentors', m => m.user_id === user.id);
    if (mentor) {
      const assignedCount = (await db.findMany('students', s => s.assigned_mentor_id === mentor.id)).length;
      mentorProfile = { ...mentor, student_count: assignedCount };
    }
  }

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url
    },
    student: studentProfile,
    mentor: mentorProfile
  });
});

module.exports = router;

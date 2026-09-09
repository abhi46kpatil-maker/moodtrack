const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../firebaseAdapter');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { formatDate, parseDate } = require('../services/stressEngine');
const { getLastNDays } = require('../services/analytics');

router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const students = await db.findMany('students');
    const mentors = await db.findMany('mentors');
    const users = await db.findMany('users');
    const alerts = await db.findMany('stress_alerts');
    const periods = await db.findMany('academic_periods');

    const checkinsNode = await db.get('checkins') || {};
    let totalCheckins = 0;
    let totalStress = 0;
    const moodCounts = { happy: 0, neutral: 0, sad: 0 };
    const stressCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    Object.values(checkinsNode).forEach(studentCheckins => {
      Object.values(studentCheckins).forEach(c => {
        totalCheckins++;
        totalStress += c.stress_level;
        moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
        stressCounts[c.stress_level] = (stressCounts[c.stress_level] || 0) + 1;
      });
    });

    const activeAlerts = alerts.filter(a => a.status === 'Needs Review');
    const reviewedAlerts = alerts.filter(a => a.status === 'Reviewed');
    const avgStress = totalCheckins > 0 ? (totalStress / totalCheckins).toFixed(2) : 0;

    // Mentor workloads
    const mentorWorkloads = await Promise.all(mentors.map(async m => {
      const mentorUser = users.find(u => u.id === m.user_id) || { name: 'Unknown' };
      const assignedCount = students.filter(s => s.assigned_mentor_id === m.id).length;
      return {
        id: m.id,
        name: mentorUser.name,
        department: m.department,
        assignedCount
      };
    }));

    res.json({
      stats: {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.is_active === 1).length,
        totalMentors: mentors.length,
        totalCheckins,
        activeAlerts: activeAlerts.length,
        reviewedAlerts: reviewedAlerts.length,
        avgStress: parseFloat(avgStress)
      },
      moodDistribution: [
        { name: 'Happy 😊', value: moodCounts.happy, key: 'happy', color: '#10B981' },
        { name: 'Neutral 😐', value: moodCounts.neutral, key: 'neutral', color: '#F59E0B' },
        { name: 'Sad 😔', value: moodCounts.sad, key: 'sad', color: '#EF4444' }
      ],
      stressDistribution: [
        { level: '1 - Very Low', count: stressCounts[1], fill: '#10B981' },
        { level: '2 - Low', count: stressCounts[2], fill: '#34D399' },
        { level: '3 - Moderate', count: stressCounts[3], fill: '#FBBF24' },
        { level: '4 - High', count: stressCounts[4], fill: '#FB923C' },
        { level: '5 - Very High', count: stressCounts[5], fill: '#F87171' }
      ],
      mentorWorkloads,
      academicPeriods: periods,
      recentAlerts: activeAlerts.slice(0, 5)
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard.' });
  }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const { search, mentorId } = req.query;
    const students = await db.findMany('students');
    const users = await db.findMany('users');
    const mentors = await db.findMany('mentors');

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const mentorMap = {};
    mentors.forEach(m => {
      const mUser = userMap[m.user_id];
      mentorMap[m.id] = { ...m, name: mUser ? mUser.name : 'Unknown' };
    });

    let list = students.map(s => {
      const u = userMap[s.user_id] || { name: 'Unknown', email: '' };
      const m = s.assigned_mentor_id ? mentorMap[s.assigned_mentor_id] : null;
      return {
        id: s.id,
        user_id: s.user_id,
        name: u.name,
        email: u.email,
        roll_number: s.roll_number,
        department: s.department,
        year_of_study: s.year_of_study,
        is_active: s.is_active,
        assigned_mentor_id: s.assigned_mentor_id,
        assigned_mentor_name: m ? m.name : 'Unassigned'
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q));
    }

    if (mentorId) {
      list = list.filter(s => s.assigned_mentor_id === mentorId);
    }

    res.json({ students: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load students.' });
  }
});

// POST /api/admin/students
router.post('/students', async (req, res) => {
  try {
    const { name, email, password, roll_number, department, year_of_study, assigned_mentor_id } = req.body;

    if (!name || !email || !password || !roll_number || !department) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await db.push('users', {
      name: name.trim(),
      email: cleanEmail,
      password_hash: hash,
      role: 'student',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      created_at: new Date().toISOString()
    });

    const newStudent = await db.push('students', {
      user_id: newUser.id,
      roll_number: roll_number.trim(),
      department: department.trim(),
      year_of_study: parseInt(year_of_study, 10) || 1,
      assigned_mentor_id: assigned_mentor_id || null,
      is_active: 1
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      student: { ...newStudent, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student.' });
  }
});

// PUT /api/admin/students/:id
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, year_of_study, assigned_mentor_id, is_active } = req.body;

    const student = await db.findOne('students', s => s.id === id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (name) {
      await db.update(`users/${student.user_id}`, { name: name.trim() });
    }

    const updated = await db.update(`students/${id}`, {
      ...(department && { department: department.trim() }),
      ...(year_of_study && { year_of_study: parseInt(year_of_study, 10) }),
      ...(assigned_mentor_id !== undefined && { assigned_mentor_id }),
      ...(is_active !== undefined && { is_active: is_active ? 1 : 0 })
    });

    res.json({ success: true, message: 'Student updated.', student: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

// GET /api/admin/mentors
router.get('/mentors', async (req, res) => {
  try {
    const { search } = req.query;
    const mentors = await db.findMany('mentors');
    const users = await db.findMany('users');
    const students = await db.findMany('students');

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    let list = mentors.map(m => {
      const u = userMap[m.user_id] || { name: 'Unknown', email: '' };
      const assignedStudents = students.filter(s => s.assigned_mentor_id === m.id);
      return {
        id: m.id,
        user_id: m.user_id,
        name: u.name,
        email: u.email,
        department: m.department,
        title: m.title,
        is_active: m.is_active,
        student_count: assignedStudents.length,
        students: assignedStudents.map(s => ({ id: s.id, roll_number: s.roll_number }))
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q));
    }

    res.json({ mentors: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load mentors.' });
  }
});

// POST /api/admin/mentors
router.post('/mentors', async (req, res) => {
  try {
    const { name, email, password, department, title } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await db.push('users', {
      name: name.trim(),
      email: cleanEmail,
      password_hash: hash,
      role: 'mentor',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      created_at: new Date().toISOString()
    });

    const newMentor = await db.push('mentors', {
      user_id: newUser.id,
      department: department.trim(),
      title: title ? title.trim() : 'Mentor',
      is_active: 1
    });

    res.status(201).json({
      success: true,
      message: 'Mentor added successfully.',
      mentor: { ...newMentor, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add mentor.' });
  }
});

// POST /api/admin/assign-mentor
// Dedicated Mentor Assignment Module
router.post('/assign-mentor', async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    const student = await db.findOne('students', s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (mentorId) {
      const mentor = await db.findOne('mentors', m => m.id === mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found.' });
      }
    }

    await db.update(`students/${studentId}`, {
      assigned_mentor_id: mentorId || null
    });

    res.json({
      success: true,
      message: mentorId ? 'Mentor assigned successfully.' : 'Student unassigned.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign mentor.' });
  }
});

// GET /api/admin/heatmap
// College-wide stress heatmap (filter by mentor, student, stress level, dates)
router.get('/heatmap', async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 14;
    const { mentorId, studentId, minStress } = req.query;

    const dates = getLastNDays(days, new Date());
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    let students = await db.findMany('students', s => s.is_active === 1);
    if (mentorId) {
      students = students.filter(s => s.assigned_mentor_id === mentorId);
    }
    if (studentId) {
      students = students.filter(s => s.id === studentId);
    }

    const users = await db.findMany('users');
    const mentors = await db.findMany('mentors');
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const mentorMap = {};
    mentors.forEach(m => {
      const mUser = userMap[m.user_id];
      mentorMap[m.id] = mUser ? mUser.name : 'Unknown';
    });

    const rows = await Promise.all(students.map(async s => {
      const u = userMap[s.user_id] || { name: 'Unknown' };
      const studentCheckinsNode = await db.get(`checkins/${s.id}`) || {};

      const dailyData = dates.map(date => {
        const c = studentCheckinsNode[date];
        return {
          date,
          // STRICT PRIVACY: NEVER expose private_note
          mood: c ? c.mood : null,
          stress: c ? c.stress_level : null
        };
      });

      const studentStressValues = dailyData.filter(d => d.stress !== null).map(d => d.stress);
      const avgStress = studentStressValues.length > 0
        ? (studentStressValues.reduce((a, b) => a + b, 0) / studentStressValues.length).toFixed(1)
        : null;

      return {
        studentId: s.id,
        name: u.name,
        roll_number: s.roll_number,
        department: s.department,
        assigned_mentor: s.assigned_mentor_id ? mentorMap[s.assigned_mentor_id] : 'Unassigned',
        avgStress,
        dailyData
      };
    }));

    // Filter by minStress if specified
    let filteredRows = rows;
    if (minStress) {
      const ms = parseInt(minStress, 10);
      filteredRows = rows.filter(r => r.dailyData.some(d => d.stress >= ms));
    }

    // Academic periods
    const allPeriods = await db.findMany('academic_periods');
    const academicPeriods = allPeriods.filter(p => p.end_date >= startDate && p.start_date <= endDate);

    res.json({
      dates,
      rows: filteredRows,
      academicPeriods
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load college heatmap.' });
  }
});

// GET /api/admin/academic-periods
router.get('/academic-periods', async (req, res) => {
  try {
    const periods = await db.findMany('academic_periods');
    periods.sort((a, b) => a.start_date.localeCompare(b.start_date));
    res.json({ periods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load academic periods.' });
  }
});

// POST /api/admin/academic-periods
router.post('/academic-periods', async (req, res) => {
  try {
    const { title, period_type, start_date, end_date, description } = req.body;
    if (!title || !period_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, period type, start date and end date are required.' });
    }

    const newPeriod = await db.push('academic_periods', {
      title: title.trim(),
      period_type,
      start_date,
      end_date,
      description: description ? description.trim() : null,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ success: true, period: newPeriod });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create academic period.' });
  }
});

// DELETE /api/admin/academic-periods/:id
router.delete('/academic-periods/:id', async (req, res) => {
  try {
    await db.remove(`academic_periods/${req.params.id}`);
    res.json({ success: true, message: 'Academic period removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete period.' });
  }
});

// GET /api/admin/alerts
router.get('/alerts', async (req, res) => {
  try {
    const { status, mentorId } = req.query;
    let alerts = await db.findMany('stress_alerts');

    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }

    if (mentorId) {
      const students = await db.findMany('students', s => s.assigned_mentor_id === mentorId);
      const studentIds = students.map(s => s.id);
      alerts = alerts.filter(a => studentIds.includes(a.student_id));
    }

    // Attach student & mentor details
    const students = await db.findMany('students');
    const mentors = await db.findMany('mentors');
    const users = await db.findMany('users');
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const enrichedAlerts = alerts.map(a => {
      const student = students.find(s => s.id === a.student_id);
      const studentUser = student ? userMap[student.user_id] : null;
      const mentor = student && student.assigned_mentor_id ? mentors.find(m => m.id === student.assigned_mentor_id) : null;
      const mentorUser = mentor ? userMap[mentor.user_id] : null;

      return {
        ...a,
        student_name: studentUser ? studentUser.name : a.student_name,
        roll_number: student ? student.roll_number : a.roll_number,
        department: student ? student.department : '',
        mentor_name: mentorUser ? mentorUser.name : 'Unassigned',
        mentor_id: mentor ? mentor.id : null
      };
    });

    enrichedAlerts.sort((a, b) => {
      if (a.status === 'Needs Review' && b.status !== 'Needs Review') return -1;
      if (a.status !== 'Needs Review' && b.status === 'Needs Review') return 1;
      return b.created_at.localeCompare(a.created_at);
    });

    res.json({ alerts: enrichedAlerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin alerts.' });
  }
});

// GET & POST Firebase Configuration (for easy inspection and injection)
router.get('/firebase-config', (req, res) => {
  res.json({
    config: db.getFirebaseConfig(),
    isLive: Boolean(db.getFirebaseConfig().databaseURL)
  });
});

router.post('/firebase-config', (req, res) => {
  const { databaseURL, apiKey, projectId, authDomain, storageBucket, messagingSenderId, appId, measurementId } = req.body;
  db.setFirebaseConfig({
    ...(databaseURL && { databaseURL }),
    ...(apiKey && { apiKey }),
    ...(projectId && { projectId }),
    ...(authDomain && { authDomain }),
    ...(storageBucket && { storageBucket }),
    ...(messagingSenderId && { messagingSenderId }),
    ...(appId && { appId }),
    ...(measurementId && { measurementId })
  });
  res.json({
    success: true,
    message: 'Firebase configuration updated successfully.',
    config: db.getFirebaseConfig()
  });
});

module.exports = router;

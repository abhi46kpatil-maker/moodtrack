const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../firebaseAdapter');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { formatDate } = require('../services/stressEngine');
const { getLastNDays } = require('../services/analytics');

router.use(authenticateToken);
router.use(requireRole(['mentor']));

function ensureMentor(req, res, next) {
  if (!req.mentor) {
    return res.status(404).json({ error: 'Mentor profile not found for this account.' });
  }
  next();
}

// GET /api/mentor/dashboard
router.get('/dashboard', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const todayStr = formatDate(new Date());
    const last7Days = getLastNDays(7, new Date());
    const minDate7 = last7Days[0];

    // Get assigned students
    const allStudents = await db.findMany('students', s => s.assigned_mentor_id === mentorId && s.is_active === 1);
    const totalAssigned = allStudents.length;

    if (totalAssigned === 0) {
      return res.json({
        metrics: {
          totalAssigned: 0,
          activeAlerts: 0,
          reviewedAlerts: 0,
          weeklyCheckins: 0,
          needingAttention: 0
        },
        students: [],
        recentAlerts: []
      });
    }

    const studentIds = allStudents.map(s => s.id);
    const allUsers = await db.findMany('users');
    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u; });

    // Alerts for these students
    const allAlerts = await db.findMany('stress_alerts', a => studentIds.includes(a.student_id));
    const activeAlerts = allAlerts.filter(a => a.status === 'Needs Review');
    const reviewedAlerts = allAlerts.filter(a => a.status === 'Reviewed');

    // Count weekly checkins & build student rows
    let weeklyCheckinsCount = 0;

    const studentRows = await Promise.all(allStudents.map(async s => {
      const u = userMap[s.user_id] || { name: 'Unknown', email: '' };
      const studentCheckinsNode = await db.get(`checkins/${s.id}`) || {};
      const checkins = Object.values(studentCheckinsNode).sort((a, b) => b.date.localeCompare(a.date));

      const weeklyCheckins = checkins.filter(c => c.date >= minDate7 && c.date <= todayStr);
      weeklyCheckinsCount += weeklyCheckins.length;

      const latest = checkins[0] || null;
      const activeAlert = activeAlerts.find(a => a.student_id === s.id) || null;

      let status = 'normal';
      let statusLabel = 'Normal';
      let priorityWeight = 1;

      const currentStress = latest ? latest.stress_level : null;

      if (activeAlert) {
        status = 'pattern';
        statusLabel = 'High-Stress Pattern';
        priorityWeight = 4;
      } else if (currentStress >= 4) {
        status = 'high';
        statusLabel = 'High Stress';
        priorityWeight = 3;
      } else if (currentStress === 3) {
        status = 'warning';
        statusLabel = 'Moderate / Warning';
        priorityWeight = 2;
      }

      // PRIVACY: DO NOT INCLUDE private_note!
      return {
        id: s.id,
        name: u.name,
        email: u.email,
        roll_number: s.roll_number,
        department: s.department,
        year_of_study: s.year_of_study,
        currentStress,
        latestMood: latest ? latest.mood : null,
        latestDate: latest ? latest.date : null,
        hasActiveAlert: Boolean(activeAlert),
        activeAlert,
        status,
        statusLabel,
        priorityWeight
      };
    }));

    // Sort: High-stress students stand out and appear near top
    studentRows.sort((a, b) => b.priorityWeight - a.priorityWeight || (b.currentStress || 0) - (a.currentStress || 0));

    const needingAttentionCount = studentRows.filter(s => s.priorityWeight >= 3).length;

    res.json({
      metrics: {
        totalAssigned,
        activeAlerts: activeAlerts.length,
        reviewedAlerts: reviewedAlerts.length,
        weeklyCheckins: weeklyCheckinsCount,
        needingAttention: needingAttentionCount
      },
      students: studentRows,
      recentAlerts: activeAlerts
    });
  } catch (err) {
    console.error('Mentor dashboard error:', err);
    res.status(500).json({ error: 'Failed to load mentor dashboard.' });
  }
});

// GET /api/mentor/students
router.get('/students', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const { search, statusFilter } = req.query;

    const assignedStudents = await db.findMany('students', s => s.assigned_mentor_id === mentorId && s.is_active === 1);
    const allUsers = await db.findMany('users');
    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u; });

    let studentList = await Promise.all(assignedStudents.map(async s => {
      const u = userMap[s.user_id] || { name: 'Unknown', email: '' };
      const studentCheckinsNode = await db.get(`checkins/${s.id}`) || {};
      const checkins = Object.values(studentCheckinsNode).sort((a, b) => b.date.localeCompare(a.date));
      const latest = checkins[0] || null;

      const activeAlert = await db.findOne('stress_alerts', a => a.student_id === s.id && a.status === 'Needs Review');

      let status = 'normal';
      let statusLabel = 'Normal';
      if (activeAlert) {
        status = 'pattern';
        statusLabel = 'High-Stress Pattern';
      } else if (latest && latest.stress_level >= 4) {
        status = 'high';
        statusLabel = 'High Stress';
      } else if (latest && latest.stress_level === 3) {
        status = 'warning';
        statusLabel = 'Moderate / Warning';
      }

      // PRIVACY: NO private_note!
      return {
        id: s.id,
        name: u.name,
        email: u.email,
        roll_number: s.roll_number,
        department: s.department,
        year_of_study: s.year_of_study,
        currentStress: latest ? latest.stress_level : null,
        latestMood: latest ? latest.mood : null,
        latestDate: latest ? latest.date : null,
        hasActiveAlert: Boolean(activeAlert),
        activeAlert,
        status,
        statusLabel
      };
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      studentList = studentList.filter(s => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q));
    }

    if (statusFilter) {
      studentList = studentList.filter(s => s.status === statusFilter);
    }

    res.json({ students: studentList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load students.' });
  }
});

// POST /api/mentor/students
// Allows mentors to enroll and add a new mentee student assigned directly to them
router.post('/students', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const { name, email, password, roll_number, department, year_of_study } = req.body;

    if (!name || !email || !roll_number) {
      return res.status(400).json({ error: 'Name, institutional email, and roll number are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email address is already registered in the college system.' });
    }

    const existingRoll = await db.findOne('students', s => s.roll_number && s.roll_number.toLowerCase() === roll_number.trim().toLowerCase());
    if (existingRoll) {
      return res.status(409).json({ error: 'A student with this roll number already exists.' });
    }

    const studentPass = password && password.trim().length > 0 ? password.trim() : 'password123';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(studentPass, salt);

    // 1. Create student user account
    const newUser = await db.push('users', {
      name: name.trim(),
      email: cleanEmail,
      password_hash: hash,
      role: 'student',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      created_at: new Date().toISOString()
    });

    // 2. Create student profile assigned to this mentor
    const dept = (department && department.trim().length > 0)
      ? department.trim()
      : (req.mentor.department || 'Computer Science & Engineering');

    const newStudent = await db.push('students', {
      user_id: newUser.id,
      roll_number: roll_number.trim(),
      department: dept,
      year_of_study: parseInt(year_of_study, 10) || 1,
      assigned_mentor_id: mentorId,
      is_active: 1
    });

    // 3. Welcome notification for the student
    await db.push(`notifications/${newUser.id}`, {
      title: 'Welcome to MoodTrack!',
      message: `You have been enrolled and assigned to faculty mentor ${req.user.name}. Please complete your daily mood & stress check-in.`,
      type: 'system',
      link: '/student/checkin',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    // 4. Activity notification for administrators
    const admins = await db.findMany('users', u => u.role === 'admin');
    for (const admin of admins) {
      await db.push(`notifications/${admin.id}`, {
        title: 'New Student Enrolled by Mentor',
        message: `${req.user.name} added and enrolled student ${newUser.name} (${newStudent.roll_number}).`,
        type: 'student_enrolled',
        link: '/admin/students',
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: `Student ${newUser.name} successfully enrolled and assigned to your roster.`,
      student: {
        id: newStudent.id,
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roll_number: newStudent.roll_number,
        department: newStudent.department,
        year_of_study: newStudent.year_of_study,
        currentStress: null,
        latestMood: null,
        latestDate: null,
        hasActiveAlert: false,
        activeAlert: null,
        status: 'normal',
        statusLabel: 'Normal'
      }
    });
  } catch (err) {
    console.error('Failed to add student via mentor console:', err);
    res.status(500).json({ error: 'Failed to add student.' });
  }
});

// GET /api/mentor/heatmap
// Mentor-only heatmap for assigned students
router.get('/heatmap', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const days = parseInt(req.query.days, 10) || 14;
    const dates = getLastNDays(days, new Date());
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const assignedStudents = await db.findMany('students', s => s.assigned_mentor_id === mentorId && s.is_active === 1);
    const allUsers = await db.findMany('users');
    const userMap = {};
    allUsers.forEach(u => { userMap[u.id] = u; });

    const rows = await Promise.all(assignedStudents.map(async s => {
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
        avgStress,
        dailyData
      };
    }));

    // Academic periods
    const allPeriods = await db.findMany('academic_periods');
    const academicPeriods = allPeriods.filter(p => p.end_date >= startDate && p.start_date <= endDate);

    res.json({
      dates,
      rows,
      academicPeriods
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load mentor heatmap.' });
  }
});

// GET /api/mentor/alerts
router.get('/alerts', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const { status } = req.query;

    const assignedStudents = await db.findMany('students', s => s.assigned_mentor_id === mentorId);
    const studentIds = assignedStudents.map(s => s.id);

    let alerts = await db.findMany('stress_alerts', a => studentIds.includes(a.student_id));

    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }

    alerts.sort((a, b) => {
      if (a.status === 'Needs Review' && b.status !== 'Needs Review') return -1;
      if (a.status !== 'Needs Review' && b.status === 'Needs Review') return 1;
      return b.created_at.localeCompare(a.created_at);
    });

    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

// POST /api/mentor/alerts/:alertId/review
router.post('/alerts/:alertId/review', ensureMentor, async (req, res) => {
  try {
    const mentorId = req.mentor.id;
    const { alertId } = req.params;
    const { reviewNotes } = req.body;

    const alert = await db.findOne('stress_alerts', a => a.id === alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    const student = await db.findOne('students', s => s.id === alert.student_id);
    if (!student || student.assigned_mentor_id !== mentorId) {
      return res.status(403).json({ error: 'Privacy Violation: You are not assigned to mentor this student.' });
    }

    const now = new Date().toISOString();
    const updatedAlert = await db.update(`stress_alerts/${alertId}`, {
      status: 'Reviewed',
      reviewed_by: mentorId,
      reviewed_by_name: req.user.name,
      reviewed_at: now,
      review_notes: reviewNotes ? reviewNotes.trim() : null
    });

    // Notify Admins
    const admins = await db.findMany('users', u => u.role === 'admin');
    for (const admin of admins) {
      await db.push(`notifications/${admin.id}`, {
        title: 'Alert Marked as Reviewed',
        message: `${req.user.name} reviewed the high-stress alert for ${alert.student_name}.`,
        type: 'alert_reviewed',
        link: '/admin/alerts',
        is_read: 0,
        created_at: now
      });
    }

    res.json({
      success: true,
      message: 'Alert marked as reviewed successfully.',
      alert: updatedAlert
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to review alert.' });
  }
});

module.exports = router;

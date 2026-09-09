const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const db = require('../firebaseAdapter');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { evaluateHighStressPatterns, formatDate } = require('../services/stressEngine');
const { getStudentAnalytics } = require('../services/analytics');

router.use(authenticateToken);
router.use(requireRole(['student']));

function ensureStudent(req, res, next) {
  if (!req.student) {
    return res.status(404).json({ error: 'Student profile not found for this account.' });
  }
  next();
}

// GET /api/student/dashboard
router.get('/dashboard', ensureStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const todayStr = req.query.date || formatDate(new Date());
    const analytics = await getStudentAnalytics(studentId, todayStr);

    res.json({
      student: {
        id: req.student.id,
        name: req.user.name,
        roll_number: req.student.roll_number,
        department: req.student.department,
        year_of_study: req.student.year_of_study
      },
      ...analytics
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

// GET /api/student/today
router.get('/today', ensureStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const todayStr = req.query.date || formatDate(new Date());

    const checkin = await db.get(`checkins/${studentId}/${todayStr}`);

    res.json({
      date: todayStr,
      completed: Boolean(checkin),
      checkin: checkin || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve today status.' });
  }
});

// POST /api/student/checkin
router.post('/checkin', ensureStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const { mood, stress_level, private_note } = req.body;
    const date = req.body.date || formatDate(new Date());

    const validMoods = ['happy', 'neutral', 'sad'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ error: 'Please select a valid mood (Happy, Neutral, or Sad).' });
    }

    const stress = parseInt(stress_level, 10);
    if (isNaN(stress) || stress < 1 || stress > 5) {
      return res.status(400).json({ error: 'Stress level must be between 1 and 5.' });
    }

    // Check duplicate
    const existing = await db.get(`checkins/${studentId}/${date}`);
    if (existing) {
      return res.status(409).json({
        error: 'You have already completed your check-in for today.',
        date
      });
    }

    const checkinId = randomUUID();
    const newCheckin = {
      id: checkinId,
      student_id: studentId,
      date,
      mood,
      stress_level: stress,
      private_note: private_note ? private_note.trim() : null,
      created_at: new Date().toISOString()
    };

    // Store in Firebase Realtime Database path: checkins/{studentId}/{date}
    await db.set(`checkins/${studentId}/${date}`, newCheckin);

    // Automatic 3-day high-stress detection engine
    const createdAlerts = await evaluateHighStressPatterns(studentId);

    res.status(201).json({
      success: true,
      message: "✓ Today's check-in completed",
      checkin: newCheckin,
      highStressDetected: createdAlerts.length > 0,
      createdAlerts
    });
  } catch (err) {
    console.error('Checkin submission error:', err);
    res.status(500).json({ error: 'Failed to submit check-in.' });
  }
});

// GET /api/student/heatmap
router.get('/heatmap', ensureStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const days = parseInt(req.query.days, 10) || 60;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const startStr = formatDate(startDate);
    const endStr = formatDate(today);

    const studentCheckinsNode = await db.get(`checkins/${studentId}`) || {};
    const checkins = Object.values(studentCheckinsNode)
      .filter(c => c.date >= startStr && c.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Academic periods
    const allPeriods = await db.findMany('academic_periods');
    const academicPeriods = allPeriods.filter(p => p.end_date >= startStr && p.start_date <= endStr);

    res.json({
      studentId,
      startDate: startStr,
      endDate: endStr,
      checkins,
      academicPeriods
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load heatmap data.' });
  }
});

// GET /api/student/history
router.get('/history', ensureStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const { preset, startDate, endDate, mood, stress, search } = req.query;

    const studentCheckinsNode = await db.get(`checkins/${studentId}`) || {};
    let checkins = Object.values(studentCheckinsNode);

    const today = new Date();
    if (preset === '7days') {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      const minDate = formatDate(d);
      checkins = checkins.filter(c => c.date >= minDate);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      const minDate = formatDate(d);
      checkins = checkins.filter(c => c.date >= minDate);
    } else if (preset === 'month') {
      const yearMonth = formatDate(today).substring(0, 7);
      checkins = checkins.filter(c => c.date.startsWith(yearMonth));
    } else if (startDate && endDate) {
      checkins = checkins.filter(c => c.date >= startDate && c.date <= endDate);
    }

    if (mood && ['happy', 'neutral', 'sad'].includes(mood)) {
      checkins = checkins.filter(c => c.mood === mood);
    }

    if (stress) {
      const s = parseInt(stress, 10);
      if (!isNaN(s) && s >= 1 && s <= 5) {
        checkins = checkins.filter(c => c.stress_level === s);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      checkins = checkins.filter(c => c.private_note && c.private_note.toLowerCase().includes(q));
    }

    checkins.sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      total: checkins.length,
      checkins
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

module.exports = router;

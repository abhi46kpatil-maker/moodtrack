const db = require('../firebaseAdapter');

/**
 * Verify if a mentor is assigned to the given studentId.
 * If not assigned, strictly returns 403 Forbidden.
 */
async function verifyMentorAssignment(req, res, next) {
  const studentId = req.params.studentId || req.query.studentId || req.body.studentId;
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required.' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'mentor' || !req.mentor) {
    return res.status(403).json({ error: 'Only authorized mentors can access this student resource.' });
  }

  const student = await db.findOne('students', s => s.id === studentId);
  if (!student || student.assigned_mentor_id !== req.mentor.id) {
    return res.status(403).json({
      error: 'Privacy Violation: You are not assigned to mentor this student.'
    });
  }

  next();
}

/**
 * Sanitize checkin payload before returning to mentors or admins.
 * STRICT PRIVACY: Private student notes must never be visible to mentors or admins.
 */
function sanitizeCheckinForNonStudent(checkin) {
  if (!checkin) return null;
  const { private_note, ...safeCheckin } = checkin;
  return safeCheckin;
}

function sanitizeCheckinsListForNonStudent(checkins) {
  return checkins.map(sanitizeCheckinForNonStudent);
}

module.exports = {
  verifyMentorAssignment,
  sanitizeCheckinForNonStudent,
  sanitizeCheckinsListForNonStudent
};

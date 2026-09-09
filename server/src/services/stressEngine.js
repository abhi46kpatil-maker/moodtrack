const db = require('../firebaseAdapter');

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function dayDifference(dateStrA, dateStrB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const dA = parseDate(dateStrA);
  const dB = parseDate(dateStrB);
  return Math.round((dB.getTime() - dA.getTime()) / msPerDay);
}

/**
 * Evaluate all check-ins for a student to detect 3+ consecutive calendar days of stress >= 4.
 */
async function evaluateHighStressPatterns(studentId) {
  // Checkins node in Firebase: checkins/{studentId}/{date}
  const studentCheckinsNode = await db.get(`checkins/${studentId}`) || {};
  const checkins = Object.values(studentCheckinsNode).sort((a, b) => a.date.localeCompare(b.date));

  if (checkins.length < 3) {
    return [];
  }

  // Find consecutive high-stress sequences (stress >= 4 and exactly 1 calendar day apart)
  const highStressSequences = [];
  let currentSeq = [];

  for (let i = 0; i < checkins.length; i++) {
    const item = checkins[i];
    if (item.stress_level >= 4) {
      if (currentSeq.length === 0) {
        currentSeq.push(item);
      } else {
        const prev = currentSeq[currentSeq.length - 1];
        const diff = dayDifference(prev.date, item.date);
        if (diff === 1) {
          currentSeq.push(item);
        } else {
          if (currentSeq.length >= 3) {
            highStressSequences.push([...currentSeq]);
          }
          currentSeq = [item];
        }
      }
    } else {
      if (currentSeq.length >= 3) {
        highStressSequences.push([...currentSeq]);
      }
      currentSeq = [];
    }
  }

  if (currentSeq.length >= 3) {
    highStressSequences.push([...currentSeq]);
  }

  const student = await db.findOne('students', s => s.id === studentId);
  const studentUser = student ? await db.findOne('users', u => u.id === student.user_id) : null;
  const studentName = studentUser ? studentUser.name : 'Student';
  const rollNumber = student ? student.roll_number : '';

  const createdAlerts = [];

  for (const seq of highStressSequences) {
    const startDate = seq[0].date;
    const endDate = seq[seq.length - 1].date;
    const pattern = seq.map(c => c.stress_level).join(' → ');
    const streakLength = seq.length;

    const existingAlert = await db.findOne(
      'stress_alerts',
      a => a.student_id === studentId && a.start_date === startDate
    );

    if (!existingAlert) {
      const newAlert = await db.push('stress_alerts', {
        student_id: studentId,
        student_name: studentName,
        roll_number: rollNumber,
        start_date: startDate,
        end_date: endDate,
        stress_pattern: pattern,
        streak_length: streakLength,
        status: 'Needs Review',
        reviewed_by: null,
        reviewed_at: null,
        review_notes: null,
        created_at: new Date().toISOString()
      });

      createdAlerts.push(newAlert);

      // Notify Mentor if assigned
      if (student && student.assigned_mentor_id) {
        const mentor = await db.findOne('mentors', m => m.id === student.assigned_mentor_id);
        if (mentor && mentor.user_id) {
          await db.push(`notifications/${mentor.user_id}`, {
            title: 'High Stress Pattern Detected',
            message: `Assigned student ${studentName} (${rollNumber}) recorded a ${streakLength}-day high-stress pattern (${pattern}) from ${startDate} to ${endDate}.`,
            type: 'high_stress_alert',
            link: '/mentor/alerts',
            is_read: 0,
            created_at: new Date().toISOString()
          });
        }
      }

      // Notify Admins
      const admins = await db.findMany('users', u => u.role === 'admin');
      for (const admin of admins) {
        await db.push(`notifications/${admin.id}`, {
          title: 'College Stress Alert',
          message: `Student ${studentName} reached a ${streakLength}-day high-stress pattern (${pattern}).`,
          type: 'high_stress_alert',
          link: '/admin/alerts',
          is_read: 0,
          created_at: new Date().toISOString()
        });
      }
    } else if (existingAlert.end_date !== endDate || existingAlert.streak_length !== streakLength) {
      // Update extended streak
      await db.update(`stress_alerts/${existingAlert.id}`, {
        end_date: endDate,
        stress_pattern: pattern,
        streak_length: streakLength
      });
    }
  }

  return createdAlerts;
}

/**
 * Calculate student check-in streaks:
 * 1. Current Check-in streak (consecutive days of check-in up to today or yesterday)
 * 2. Current High-stress streak (consecutive stress >= 4 up to most recent check-in)
 */
async function calculateStreaks(studentId, referenceDateStr) {
  const studentCheckinsNode = await db.get(`checkins/${studentId}`) || {};
  const checkins = Object.values(studentCheckinsNode).sort((a, b) => b.date.localeCompare(a.date));

  if (checkins.length === 0) {
    return { checkinStreak: 0, highStressStreak: 0 };
  }

  const todayStr = referenceDateStr || formatDate(new Date());

  // Check-in streak
  let checkinStreak = 0;
  const latestDate = checkins[0].date;
  const diffFromToday = dayDifference(latestDate, todayStr);

  if (diffFromToday <= 1) {
    checkinStreak = 1;
    let expectedDate = latestDate;

    for (let i = 1; i < checkins.length; i++) {
      const prevDate = checkins[i].date;
      const diff = dayDifference(prevDate, expectedDate);
      if (diff === 1) {
        checkinStreak++;
        expectedDate = prevDate;
      } else {
        break;
      }
    }
  }

  // High-stress streak
  let highStressStreak = 0;
  if (checkins[0].stress_level >= 4) {
    highStressStreak = 1;
    let expectedDate = checkins[0].date;
    for (let i = 1; i < checkins.length; i++) {
      const curr = checkins[i];
      const diff = dayDifference(curr.date, expectedDate);
      if (diff === 1 && curr.stress_level >= 4) {
        highStressStreak++;
        expectedDate = curr.date;
      } else {
        break;
      }
    }
  }

  return { checkinStreak, highStressStreak };
}

module.exports = {
  parseDate,
  formatDate,
  dayDifference,
  evaluateHighStressPatterns,
  calculateStreaks
};

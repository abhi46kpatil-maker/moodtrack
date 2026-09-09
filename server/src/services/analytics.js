const db = require('../firebaseAdapter');
const { calculateStreaks, formatDate, parseDate, dayDifference } = require('./stressEngine');

function getLastNDays(numDays = 7, refDate = new Date()) {
  const dates = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

async function getStudentAnalytics(studentId, referenceDateStr) {
  const todayStr = referenceDateStr || formatDate(new Date());
  const last7Days = getLastNDays(7, parseDate(todayStr));
  const minDate7 = last7Days[0];

  const studentCheckinsNode = await db.get(`checkins/${studentId}`) || {};
  const allCheckins = Object.values(studentCheckinsNode);

  const checkins7Days = allCheckins.filter(c => c.date >= minDate7 && c.date <= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const checkinMap7 = {};
  checkins7Days.forEach(c => {
    checkinMap7[c.date] = c;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const moodTrend7 = [];
  const stressTrend7 = [];
  const stressValues = [];
  const moodCounts = { happy: 0, neutral: 0, sad: 0 };

  last7Days.forEach(date => {
    const d = parseDate(date);
    const dayLabel = dayNames[d.getUTCDay()];
    const c = checkinMap7[date];

    if (c) {
      moodTrend7.push({
        date,
        day: dayLabel,
        mood: c.mood,
        stress: c.stress_level
      });
      stressTrend7.push({
        date,
        day: dayLabel,
        stress: c.stress_level
      });
      stressValues.push(c.stress_level);
      moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
    } else {
      moodTrend7.push({
        date,
        day: dayLabel,
        mood: null,
        stress: null
      });
      stressTrend7.push({
        date,
        day: dayLabel,
        stress: null
      });
    }
  });

  const numCheckins7 = checkins7Days.length;
  const avgStress7 = numCheckins7 > 0
    ? (stressValues.reduce((a, b) => a + b, 0) / numCheckins7).toFixed(1)
    : null;
  const highestStress7 = numCheckins7 > 0 ? Math.max(...stressValues) : null;
  const lowestStress7 = numCheckins7 > 0 ? Math.min(...stressValues) : null;

  let mostCommonMood7 = 'None';
  let maxMoodCount = 0;
  for (const [m, count] of Object.entries(moodCounts)) {
    if (count > maxMoodCount) {
      maxMoodCount = count;
      mostCommonMood7 = m;
    }
  }

  const streaks = await calculateStreaks(studentId, todayStr);
  const todayCheckin = checkinMap7[todayStr] || null;

  // Previous 7 days comparison
  const prev7Days = getLastNDays(14, parseDate(todayStr)).slice(0, 7);
  const prevCheckins = allCheckins.filter(c => c.date >= prev7Days[0] && c.date <= prev7Days[6]);
  const prevAvgStress = prevCheckins.length > 0
    ? (prevCheckins.reduce((a, b) => a + b.stress_level, 0) / prevCheckins.length).toFixed(1)
    : null;

  const insights = [];

  if (numCheckins7 >= 5) {
    insights.push(`Great consistency! You completed ${numCheckins7} of 7 check-ins this past week.`);
  } else if (numCheckins7 > 0) {
    insights.push(`You completed ${numCheckins7} check-in${numCheckins7 > 1 ? 's' : ''} over the past 7 days.`);
  } else {
    insights.push(`No check-ins logged yet this week. Recording daily helps you spot personal patterns.`);
  }

  if (avgStress7 && prevAvgStress) {
    const diff = (parseFloat(avgStress7) - parseFloat(prevAvgStress)).toFixed(1);
    if (diff < 0) {
      insights.push(`Your weekly average stress decreased by ${Math.abs(diff)} points compared to the previous week.`);
    } else if (diff > 0) {
      insights.push(`Your weekly average stress was slightly higher by ${diff} points than the previous week.`);
    } else {
      insights.push(`Your average stress remained steady compared to the prior week.`);
    }
  }

  if (highestStress7 !== null && highestStress7 >= 4) {
    const highestDay = checkins7Days.find(c => c.stress_level === highestStress7);
    if (highestDay) {
      const dName = dayNames[parseDate(highestDay.date).getUTCDay()];
      insights.push(`Your highest stress (${highestStress7}/5) was recorded on ${dName}.`);
    }
  }

  if (mostCommonMood7 !== 'None') {
    const moodEmoji = mostCommonMood7 === 'happy' ? '😊 Happy' : mostCommonMood7 === 'neutral' ? '😐 Neutral' : '😔 Sad';
    insights.push(`Your most frequent mood this week was ${moodEmoji}.`);
  }

  return {
    todayStr,
    todayCompleted: Boolean(todayCheckin),
    todayCheckin,
    currentStress: todayCheckin ? todayCheckin.stress_level : (checkins7Days.length > 0 ? checkins7Days[checkins7Days.length - 1].stress_level : null),
    weeklySummary: {
      avgStress: avgStress7 ? parseFloat(avgStress7) : null,
      highestStress: highestStress7,
      lowestStress: lowestStress7,
      mostCommonMood: mostCommonMood7 !== 'None' ? mostCommonMood7 : null,
      checkinCount: numCheckins7,
      totalDays: 7
    },
    streaks: {
      checkinStreak: streaks.checkinStreak,
      highStressStreak: streaks.highStressStreak
    },
    trends: {
      moodTrend: moodTrend7,
      stressTrend: stressTrend7
    },
    insights
  };
}

module.exports = {
  getLastNDays,
  getStudentAnalytics
};

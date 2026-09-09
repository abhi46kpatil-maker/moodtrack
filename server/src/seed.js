const bcrypt = require('bcryptjs');
const db = require('./firebaseAdapter');
const { evaluateHighStressPatterns, formatDate } = require('./services/stressEngine');

async function seed() {
  console.log('🌱 Seeding MoodTrack with realistic college dataset into Firebase adapter...');

  // Reset store to empty structure
  await db.set('users', {});
  await db.set('students', {});
  await db.set('mentors', {});
  await db.set('checkins', {});
  await db.set('stress_alerts', {});
  await db.set('academic_periods', {});
  await db.set('notifications', {});

  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  // 1. Admin
  const adminUser = await db.set('users/admin_user_1', {
    id: 'admin_user_1',
    name: 'Dean Patricia Miller',
    email: 'admin@moodtrack.edu',
    password_hash: defaultPasswordHash,
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  });

  // 2. Mentors
  const mentorUsersData = [
    {
      id: 'mentor_u1',
      mentorId: 'mentor_1',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@moodtrack.edu',
      department: 'Computer Science & Engineering',
      title: 'Associate Professor & Student Advisor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'mentor_u2',
      mentorId: 'mentor_2',
      name: 'Prof. Sarah Chen',
      email: 'sarah.chen@moodtrack.edu',
      department: 'Information Technology',
      title: 'Assistant Professor & Wellness Liaison',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'mentor_u3',
      mentorId: 'mentor_3',
      name: 'Dr. Marcus Rivera',
      email: 'marcus.rivera@moodtrack.edu',
      department: 'Electrical & Electronics',
      title: 'Professor & Dean of Student Affairs',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const m of mentorUsersData) {
    await db.set(`users/${m.id}`, {
      id: m.id,
      name: m.name,
      email: m.email,
      password_hash: defaultPasswordHash,
      role: 'mentor',
      avatar_url: m.avatar,
      created_at: new Date().toISOString()
    });

    await db.set(`mentors/${m.mentorId}`, {
      id: m.mentorId,
      user_id: m.id,
      department: m.department,
      title: m.title,
      is_active: 1
    });
  }

  // 3. Students
  const studentData = [
    {
      id: 'student_u1',
      studentId: 'student_1',
      name: 'Alex Kim',
      email: 'alex.kim@student.moodtrack.edu',
      roll_number: 'CS2023-042',
      department: 'Computer Science & Engineering',
      year_of_study: 3,
      mentorId: 'mentor_1',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      profileType: 'sustained_high' // Explicit 4 -> 5 -> 4 pattern
    },
    {
      id: 'student_u2',
      studentId: 'student_2',
      name: 'Rahul Patil',
      email: 'rahul.patil@student.moodtrack.edu',
      roll_number: 'CS2023-088',
      department: 'Computer Science & Engineering',
      year_of_study: 3,
      mentorId: 'mentor_1',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      profileType: 'reviewed_high' // 5 -> 5 -> 5 previously reviewed
    },
    {
      id: 'student_u3',
      studentId: 'student_3',
      name: 'Maya Lin',
      email: 'maya.lin@student.moodtrack.edu',
      roll_number: 'IT2023-019',
      department: 'Information Technology',
      year_of_study: 2,
      mentorId: 'mentor_2',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      profileType: 'thriving' // Mostly happy, low stress
    },
    {
      id: 'student_u4',
      studentId: 'student_4',
      name: 'Jordan Taylor',
      email: 'jordan.taylor@student.moodtrack.edu',
      roll_number: 'IT2023-055',
      department: 'Information Technology',
      year_of_study: 2,
      mentorId: 'mentor_2',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      profileType: 'fluctuating'
    },
    {
      id: 'student_u5',
      studentId: 'student_5',
      name: 'Priya Sharma',
      email: 'priya.sharma@student.moodtrack.edu',
      roll_number: 'EE2023-012',
      department: 'Electrical & Electronics',
      year_of_study: 4,
      mentorId: 'mentor_3',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      profileType: 'moderate'
    },
    {
      id: 'student_u6',
      studentId: 'student_6',
      name: 'David Okafor',
      email: 'david.okafor@student.moodtrack.edu',
      roll_number: 'EE2023-074',
      department: 'Electrical & Electronics',
      year_of_study: 4,
      mentorId: 'mentor_3',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      profileType: 'low_stress'
    },
    {
      id: 'student_u7',
      studentId: 'student_7',
      name: 'Elena Rostova',
      email: 'elena.rostova@student.moodtrack.edu',
      roll_number: 'CS2023-110',
      department: 'Computer Science & Engineering',
      year_of_study: 1,
      mentorId: null, // Unassigned for assignment demo
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      profileType: 'normal'
    }
  ];

  for (const s of studentData) {
    await db.set(`users/${s.id}`, {
      id: s.id,
      name: s.name,
      email: s.email,
      password_hash: defaultPasswordHash,
      role: 'student',
      avatar_url: s.avatar,
      created_at: new Date().toISOString()
    });

    await db.set(`students/${s.studentId}`, {
      id: s.studentId,
      user_id: s.id,
      roll_number: s.roll_number,
      department: s.department,
      year_of_study: s.year_of_study,
      assigned_mentor_id: s.mentorId,
      is_active: 1
    });
  }

  // 4. Academic Periods
  const today = new Date();
  const dateOffset = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  const academicPeriods = [
    {
      id: 'period_1',
      title: 'Mid-Semester Examination Week',
      period_type: 'exam',
      start_date: dateOffset(-8),
      end_date: dateOffset(-2),
      description: 'Centralized semester midterm evaluations across all engineering departments.',
      created_at: new Date().toISOString()
    },
    {
      id: 'period_2',
      title: 'Capstone Project Code Submissions',
      period_type: 'assignment_deadline',
      start_date: dateOffset(2),
      end_date: dateOffset(5),
      description: 'Final repository pull request deadline and technical documentation submission.',
      created_at: new Date().toISOString()
    },
    {
      id: 'period_3',
      title: 'Internal Lab Practical Viva',
      period_type: 'internal_assessment',
      start_date: dateOffset(-22),
      end_date: dateOffset(-19),
      description: 'Departmental laboratory viva and benchmark demonstrations.',
      created_at: new Date().toISOString()
    }
  ];

  for (const p of academicPeriods) {
    await db.set(`academic_periods/${p.id}`, p);
  }

  // 5. Generate Realistic Daily Check-ins (past 30 days)
  console.log('Generating 30 days of realistic check-in data...');

  for (const s of studentData) {
    for (let dayAgo = 30; dayAgo >= 0; dayAgo--) {
      // Occasional missed day (except for high-stress streaks)
      if (dayAgo > 7 && Math.random() < 0.12 && s.profileType !== 'sustained_high') {
        continue; // simulate missing checkin date
      }

      const dStr = dateOffset(-dayAgo);
      let mood = 'happy';
      let stress = 2;
      let note = null;

      if (s.profileType === 'sustained_high') {
        // Alex Kim: Explicit 4 -> 5 -> 4 pattern on days -3, -2, -1
        if (dayAgo === 3) {
          mood = 'sad';
          stress = 4;
          note = 'Struggling to keep up with OS assignment and database concurrency project.';
        } else if (dayAgo === 2) {
          mood = 'sad';
          stress = 5;
          note = 'Barely slept last night. Panic attack during practice quiz. Need to organize tasks.';
        } else if (dayAgo === 1) {
          mood = 'neutral';
          stress = 4;
          note = 'Still high anxiety about midterms tomorrow. Trying 5-minute deep breathing.';
        } else if (dayAgo === 0) {
          mood = 'neutral';
          stress = 4;
          note = 'Took the breathing break earlier today. Still tense but slightly more grounded.';
        } else if (dayAgo >= 4 && dayAgo <= 6) {
          mood = 'neutral';
          stress = 3;
          note = 'Studied in library for 6 hours.';
        } else {
          mood = Math.random() > 0.4 ? 'happy' : 'neutral';
          stress = Math.floor(Math.random() * 2) + 1; // 1 or 2
        }
      } else if (s.profileType === 'reviewed_high') {
        // Rahul Patil: High stress 2 weeks ago (days -16, -15, -14: 5 -> 5 -> 5), now recovered
        if (dayAgo >= 14 && dayAgo <= 16) {
          mood = 'sad';
          stress = 5;
          note = 'Personal family emergency combined with circuit lab exam.';
        } else if (dayAgo < 14) {
          mood = 'happy';
          stress = Math.floor(Math.random() * 2) + 2; // 2 or 3
          note = dayAgo === 0 ? 'Feeling much more balanced after advisor check-in.' : null;
        } else {
          mood = 'neutral';
          stress = 3;
        }
      } else if (s.profileType === 'thriving') {
        // Maya Lin: mostly happy, low stress
        mood = Math.random() > 0.25 ? 'happy' : 'neutral';
        stress = Math.random() > 0.7 ? 2 : 1;
        if (dayAgo === 0) {
          note = 'Morning run in the campus park was refreshing! Ready for lecture.';
        }
      } else if (s.profileType === 'fluctuating') {
        // Jordan Taylor: varies 2 - 4
        const moods = ['happy', 'neutral', 'sad'];
        mood = moods[Math.floor(Math.random() * moods.length)];
        stress = Math.floor(Math.random() * 3) + 2; // 2 to 4
        if (stress >= 4) {
          note = 'Long design critique session today. Felt a bit drained.';
        }
      } else {
        // Default normal
        mood = Math.random() > 0.5 ? 'happy' : 'neutral';
        stress = Math.floor(Math.random() * 2) + 2; // 2 or 3
      }

      await db.set(`checkins/${s.studentId}/${dStr}`, {
        id: `chk_${s.studentId}_${dStr}`,
        student_id: s.studentId,
        date: dStr,
        mood,
        stress_level: stress,
        private_note: note,
        created_at: `${dStr}T09:30:00.000Z`
      });
    }

    // Run high stress engine to generate genuine alerts
    await evaluateHighStressPatterns(s.studentId);
  }

  // Mark Rahul Patil's older alert as Reviewed for demo realism
  const rahulAlert = await db.findOne('stress_alerts', a => a.student_id === 'student_2');
  if (rahulAlert) {
    await db.update(`stress_alerts/${rahulAlert.id}`, {
      status: 'Reviewed',
      reviewed_by: 'mentor_1',
      reviewed_by_name: 'Dr. Aris Thorne',
      reviewed_at: dateOffset(-10) + 'T14:20:00.000Z',
      review_notes: 'Met with student during office hours. Assisted with deadline extension and connected with campus support.'
    });
  }

  // 6. Pre-seed Notifications for each role
  // Student Alex Kim
  await db.push('notifications/student_u1', {
    title: 'Daily Wellness Reminder',
    message: "Remember to take 60 seconds for your mindful breathing exercise today.",
    type: 'checkin_reminder',
    link: '/student/dashboard',
    is_read: 0,
    created_at: new Date().toISOString()
  });

  // Mentor Dr. Aris Thorne
  await db.push('notifications/mentor_u1', {
    title: 'High Stress Pattern Detected',
    message: 'Assigned student Alex Kim (CS2023-042) recorded 3 consecutive days of high stress (4 → 5 → 4).',
    type: 'high_stress_alert',
    link: '/mentor/alerts',
    is_read: 0,
    created_at: new Date().toISOString()
  });

  // Admin Dean Patricia Miller
  await db.push('notifications/admin_user_1', {
    title: 'College Wellness Report Ready',
    message: 'Weekly college-wide stress trend update has been compiled for review.',
    type: 'system',
    link: '/admin/dashboard',
    is_read: 0,
    created_at: new Date().toISOString()
  });

  console.log('✅ Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Student 1 (Alert Active): alex.kim@student.moodtrack.edu / password123');
  console.log('  Student 2 (Thriving):     maya.lin@student.moodtrack.edu / password123');
  console.log('  Mentor 1:                aris.thorne@moodtrack.edu / password123');
  console.log('  Mentor 2:                sarah.chen@moodtrack.edu / password123');
  console.log('  Admin:                   admin@moodtrack.edu / password123');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
}

module.exports = seed;

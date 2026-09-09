const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const mentorRoutes = require('./routes/mentors');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'MoodTrack College Wellness System'
  });
});

// Serve frontend in production build
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(200).send('MoodTrack API Server is running. Client build in progress or running via Vite dev server.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MoodTrack Backend API running on http://localhost:${PORT}`);
});

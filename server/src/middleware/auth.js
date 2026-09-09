const jwt = require('jsonwebtoken');
const db = require('../firebaseAdapter');

const JWT_SECRET = process.env.JWT_SECRET || 'moodtrack-college-wellness-secure-key-2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }

    try {
      const user = await db.findOne('users', u => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User no longer exists.' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      };

      if (user.role === 'student') {
        const student = await db.findOne('students', s => s.user_id === user.id);
        if (student) {
          req.student = student;
        }
      } else if (user.role === 'mentor') {
        const mentor = await db.findOne('mentors', m => m.user_id === user.id);
        if (mentor) {
          req.mentor = mentor;
        }
      }

      next();
    } catch (e) {
      console.error('Auth verification error:', e);
      return res.status(500).json({ error: 'Internal authentication error.' });
    }
  });
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireRole
};

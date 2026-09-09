const express = require('express');
const router = express.Router();
const db = require('../firebaseAdapter');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifsNode = await db.get(`notifications/${userId}`) || {};
    const notifs = Object.values(userNotifsNode).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const unreadCount = notifs.filter(n => !n.is_read).length;

    res.json({
      unreadCount,
      notifications: notifs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    await db.update(`notifications/${userId}/${notifId}`, {
      is_read: 1
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifsNode = await db.get(`notifications/${userId}`) || {};

    for (const key of Object.keys(userNotifsNode)) {
      userNotifsNode[key].is_read = 1;
    }

    await db.set(`notifications/${userId}`, userNotifsNode);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
});

module.exports = router;

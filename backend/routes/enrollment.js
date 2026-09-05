const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const enrolled = db.prepare('SELECT * FROM enrollments WHERE userId = ? ORDER BY createdAt').all(req.userId);
  res.json({ enrolled });
});

router.patch('/:title/progress', (req, res) => {
  const enrollment = db.prepare('SELECT * FROM enrollments WHERE userId = ? AND title = ?').get(req.userId, req.params.title);
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled in this course' });

  const amount = Math.min(100, Math.max(1, Number(req.body.amount) || 10));
  const progress = Math.min(100, enrollment.progress + amount);
  db.prepare("UPDATE enrollments SET progress = ?, updatedAt = datetime('now') WHERE id = ?").run(progress, enrollment.id);

  const updated = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollment.id);
  res.json({ enrollment: updated });
});

module.exports = router;

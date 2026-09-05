const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/:courseId', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE courseId = ? ORDER BY createdAt DESC').all(req.params.courseId);
  res.json({ reviews });
});

router.post('/:courseId', requireAuth, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: 'rating and comment required' });

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId);
  const info = db
    .prepare('INSERT INTO reviews (courseId, userId, name, rating, comment) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.courseId, req.userId, user.name, rating, comment);

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ review });
});

module.exports = router;

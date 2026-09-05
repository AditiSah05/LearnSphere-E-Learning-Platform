const express = require('express');
const Enrollment = require('../models/Enrollment');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const enrolled = await Enrollment.find({ user: req.userId }).sort('createdAt');
  res.json({ enrolled });
});

router.patch('/:title/progress', async (req, res) => {
  const enrollment = await Enrollment.findOne({ user: req.userId, title: req.params.title });
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled in this course' });

  const amount = Math.min(100, Math.max(1, Number(req.body.amount) || 10));
  enrollment.progress = Math.min(100, enrollment.progress + amount);
  await enrollment.save();
  res.json({ enrollment });
});

module.exports = router;

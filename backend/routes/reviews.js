const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/:courseId', async (req, res) => {
  const reviews = await Review.find({ courseId: req.params.courseId }).sort('-createdAt');
  res.json({ reviews });
});

router.post('/:courseId', requireAuth, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: 'rating and comment required' });

  const user = await User.findById(req.userId);
  const review = await Review.create({
    courseId: req.params.courseId,
    user: req.userId,
    name: user.name,
    rating,
    comment,
  });
  res.status(201).json({ review });
});

module.exports = router;

const express = require('express');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required' });

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(200).json({ message: 'Already subscribed' });

  await Subscriber.create({ email });
  res.status(201).json({ message: 'Subscribed' });
});

module.exports = router;

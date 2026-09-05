const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required' });

  const existing = db.prepare('SELECT id FROM subscribers WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(200).json({ message: 'Already subscribed' });

  db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email.toLowerCase());
  res.status(201).json({ message: 'Subscribed' });
});

module.exports = router;

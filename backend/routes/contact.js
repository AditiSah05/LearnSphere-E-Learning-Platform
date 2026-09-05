const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'name, email, subject and message are required' });
  }

  db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').run(name, email, subject, message);
  res.status(201).json({ message: 'Message received' });
});

module.exports = router;

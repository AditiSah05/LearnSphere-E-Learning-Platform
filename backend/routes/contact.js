const express = require('express');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'name, email, subject and message are required' });
  }

  await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ message: 'Message received' });
});

module.exports = router;

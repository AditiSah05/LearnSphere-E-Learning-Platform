const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { sendResetEmail } = require('../mailer');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email.toLowerCase(), hashed);

    res.status(201).json({
      token: signToken(info.lastInsertRowid),
      user: { id: info.lastInsertRowid, name, email: email.toLowerCase() },
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email, password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: signToken(user.id),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required' });

  // Always respond the same way whether or not the email exists —
  // don't let this endpoint reveal which emails are registered.
  const genericResponse = { message: "If that email is registered, we've sent a reset link." };

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.json(genericResponse);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  db.prepare('INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password.html?token=${token}`;

  try {
    await sendResetEmail(email, resetLink);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
  }

  res.json(genericResponse);
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'token and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const reset = db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);
  if (!reset || new Date(reset.expiresAt) < new Date()) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, reset.userId);
  db.prepare('DELETE FROM password_resets WHERE userId = ?').run(reset.userId);

  res.json({ message: 'Password updated. You can now log in.' });
});

module.exports = router;

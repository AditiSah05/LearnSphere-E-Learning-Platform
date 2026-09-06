const nodemailer = require('nodemailer');

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendResetEmail(to, resetLink) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service not configured (EMAIL_USER/EMAIL_PASS missing)');
  }

  await transporter.sendMail({
    from: `LearnSphere <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your LearnSphere password',
    html: `
      <p>You requested a password reset for your LearnSphere account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a> — this link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

module.exports = { sendResetEmail };

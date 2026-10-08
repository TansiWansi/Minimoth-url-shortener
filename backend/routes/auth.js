const express = require('express');
const router = express.Router();
const db = require('../db');

const MINIMOTH_BASE = 'https://api.minimoth.dev';

// POST /auth/send-otp
// Body: { phone: "+919876543210" }
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid phone number with country code is required (e.g. +919876543210)' });
  }

  try {
    const response = await fetch(`${MINIMOTH_BASE}/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.MINIMOTH_API_KEY,
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent', otp_id: data.otp_id });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify-otp
// Body: { phone, otp_id, otp }
router.post('/verify-otp', async (req, res) => {
  const { phone, otp_id, otp } = req.body;

  if (!phone || !otp_id || !otp) {
    return res.status(400).json({ error: 'phone, otp_id, and otp are required' });
  }

  try {
    const response = await fetch(`${MINIMOTH_BASE}/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.MINIMOTH_API_KEY,
      },
      body: JSON.stringify({ phone, code: otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'OTP verification failed' });
    }

    // Upsert user
    db.prepare(`INSERT OR IGNORE INTO users (phone) VALUES (?)`).run(phone);
    const user = db.prepare(`SELECT * FROM users WHERE phone = ?`).get(phone);

    // Store session tokens from Minimoth
    db.prepare(`
      INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(user.id, data.access_token, data.refresh_token || null, data.expires_at || null);

    res.json({
      message: 'Login successful',
      access_token: data.access_token,
      phone: user.phone,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const db = require('../db');
const { requireAuth } = require('../middleware');

// POST /links — shorten a URL (auth required)
router.post('/', requireAuth, (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url); // validates URL format
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const short_code = nanoid(7);

  db.prepare(`
    INSERT INTO links (user_id, original_url, short_code) VALUES (?, ?, ?)
  `).run(req.userId, url, short_code);

  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.status(201).json({
    short_url: `${base}/${short_code}`,
    short_code,
    original_url: url,
  });
});

// GET /links — list authenticated user's links
router.get('/', requireAuth, (req, res) => {
  const links = db
    .prepare(`SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC`)
    .all(req.userId);

  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  const result = links.map((l) => ({
    ...l,
    short_url: `${base}/${l.short_code}`,
  }));

  res.json(result);
});

module.exports = router;

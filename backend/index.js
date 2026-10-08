require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Allow requests from the frontend dev server
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ];
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const db = require('./db');
const authRouter = require('./routes/auth');
const linksRouter = require('./routes/links');

app.use('/auth', authRouter);
app.use('/links', linksRouter);

// GET /:code — redirect short URL (public)
app.get('/:code', (req, res) => {
  const { code } = req.params;
  if (!code || code.length > 20) return res.status(404).json({ error: 'Not found' });

  const link = db.prepare('SELECT * FROM links WHERE short_code = ?').get(code);
  if (!link) return res.status(404).json({ error: 'Short link not found' });

  // Increment click count
  db.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?').run(link.id);

  res.redirect(301, link.original_url);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

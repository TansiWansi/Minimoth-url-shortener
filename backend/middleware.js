const db = require('./db');

// Verify that a session's access_token is valid and return the user
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const session = db
    .prepare('SELECT * FROM sessions WHERE access_token = ?')
    .get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = session.user_id;
  next();
}

module.exports = { requireAuth };

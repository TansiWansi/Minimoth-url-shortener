import { useState, useEffect } from 'react';
import { getLinks } from '../api';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LinksPage({ onNavigate, onLogout }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    getLinks()
      .then(setLinks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function copyToClipboard(id, text) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand-sm">
          <span className="brand-icon">⚡</span>
          <span>snip.link</span>
        </div>
        <nav className="topbar-nav">
          <button className="btn-nav" onClick={() => onNavigate('home')}>Shorten</button>
          <button className="btn-nav active" onClick={() => onNavigate('links')}>My Links</button>
          <button className="btn-nav logout" onClick={onLogout}>Logout</button>
        </nav>
      </header>

      <main className="links-section">
        <h2>My Links</h2>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-msg">{error}</p>}

        {!loading && links.length === 0 && (
          <div className="empty-state">
            <p>No links yet.</p>
            <button className="btn-primary" onClick={() => onNavigate('home')}>
              Create your first link →
            </button>
          </div>
        )}

        <div className="links-list">
          {links.map((link) => (
            <div className="link-card" key={link.id}>
              <div className="link-card-top">
                <a
                  href={`${API}/${link.short_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="short-url"
                >
                  {API.replace('http://', '').replace('https://', '')}/{link.short_code}
                </a>
                <button
                  className="btn-copy"
                  onClick={() =>
                    copyToClipboard(link.id, `${API}/${link.short_code}`)
                  }
                >
                  {copiedId === link.id ? '✓' : 'Copy'}
                </button>
              </div>
              <p className="original-url" title={link.original_url}>
                {link.original_url}
              </p>
              <div className="link-meta">
                <span className="click-badge">
                  {link.clicks} click{link.clicks !== 1 ? 's' : ''}
                </span>
                <span className="link-date">
                  {new Date(link.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

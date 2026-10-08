import { useState } from 'react';
import { createLink } from '../api';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function HomePage({ phone, onNavigate, onLogout }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleShorten(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await createLink(url);
      setResult(data);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand-sm">
          <span className="brand-icon">⚡</span>
          <span>snip.link</span>
        </div>
        <nav className="topbar-nav">
          <button className="btn-nav active" onClick={() => onNavigate('home')}>Shorten</button>
          <button className="btn-nav" onClick={() => onNavigate('links')}>My Links</button>
          <button className="btn-nav logout" onClick={onLogout}>Logout</button>
        </nav>
      </header>

      <main className="hero-section">
        <h2>Shorten your URL</h2>
        <p className="hero-sub">Paste a long link, get a clean short one instantly.</p>

        <form onSubmit={handleShorten} className="shorten-form">
          <div className="input-row">
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '…' : 'Shorten'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </form>

        {result && (
          <div className="result-card">
            <p className="result-label">Your short link</p>
            <div className="result-row">
              <a href={result.short_url} target="_blank" rel="noreferrer" className="short-url">
                {result.short_url}
              </a>
              <button
                className="btn-copy"
                onClick={() => copyToClipboard(result.short_url)}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="result-original">↗ {result.original_url}</p>
          </div>
        )}
      </main>
    </div>
  );
}

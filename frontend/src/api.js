const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  // Only auto-logout when the request was authenticated and the token was rejected.
  // For public endpoints (e.g. /auth/*) a 401 from Minimoth means bad API key —
  // surface it as a normal error instead of wiping state and crashing.
  if (res.status === 401 && token) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('phone');
    window.location.reload();
    return;
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const sendOtp = (phone) =>
  request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });

export const verifyOtp = (phone, otp_id, otp) =>
  request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp_id, otp }) });

export const createLink = (url) =>
  request('/links', { method: 'POST', body: JSON.stringify({ url }) });

export const getLinks = () => request('/links');

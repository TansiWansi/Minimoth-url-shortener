import { useState } from 'react';
import { sendOtp, verifyOtp } from '../api';

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [otpId, setOtpId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendOtp(phone);
      setOtpId(data.otp_id);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp(phone, otpId, otp);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('phone', data.phone);
      onLogin(data.phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <h1>snip.link</h1>
        </div>
        <p className="subtitle">Shorten URLs. Share fast.</p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <label htmlFor="phone-input">Phone number</label>
            <input
              id="phone-input"
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="hint">Include country code (e.g. +91 for India)</p>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <label htmlFor="otp-input">Enter OTP</label>
            <p className="hint">Sent to {phone} via WhatsApp / SMS</p>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
            >
              ← Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

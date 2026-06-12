import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check Your Email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            If <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong> is registered in our system,
            you'll receive a password reset link shortly.
          </p>

          <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>💡 Didn't receive an email?</div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.8 }}>
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>The link expires in <strong>30 minutes</strong></li>
              <li>Ask your admin to reset your password directly</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setSubmitted(false); setEmail(''); }}
            >
              🔄 Try a Different Email
            </button>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" style={{ fontSize: '1.5rem' }}>🔐</div>
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fp-email">Your Email Address</label>
            <input
              id="fp-email"
              type="email"
              className="form-control"
              placeholder="your@isoftzone.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            id="forgot-submit-btn"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
            disabled={loading || !email}
          >
            {loading ? '⌛ Sending...' : '📤 Send Reset Link'}
          </button>
        </form>

        <hr className="divider" />

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ← Back to Login
          </Link>
        </div>

        <div className="alert alert-info" style={{ marginTop: '1.25rem', fontSize: '0.8rem' }}>
          <strong>Note:</strong> If email is not configured on this server, the reset link will appear in the <strong>backend console</strong> (terminal window).
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

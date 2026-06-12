import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [tokenInfo, setTokenInfo] = useState(null);    // { name }
  const [tokenError, setTokenError] = useState('');
  const [verifying, setVerifying] = useState(true);

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No reset token provided.');
      setVerifying(false);
      return;
    }
    API.get(`/auth/verify-reset-token/${token}`)
      .then((r) => { setTokenInfo(r.data.data); })
      .catch((err) => { setTokenError(err.response?.data?.message || 'Invalid or expired link.'); })
      .finally(() => setVerifying(false));
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (tokenError) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Link Invalid or Expired</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{tokenError}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Reset links expire after <strong>30 minutes</strong>. Please request a new one.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
              🔄 Request New Link
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Password Reset!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Your password has been changed successfully. Redirecting to login...
          </p>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo" style={{ fontSize: '1.5rem' }}>🔑</div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          {tokenInfo?.name ? `Hi ${tokenInfo.name}, set your new password below` : 'Set your new password'}
        </p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              name="confirm"
              type="password"
              className="form-control"
              placeholder="Repeat your new password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password match indicator */}
          {form.confirm && (
            <div style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
              {form.password === form.confirm
                ? <span style={{ color: 'var(--success)' }}>✅ Passwords match</span>
                : <span style={{ color: 'var(--danger)' }}>❌ Passwords do not match</span>
              }
            </div>
          )}

          <button
            type="submit"
            id="reset-submit-btn"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
            disabled={loading || form.password !== form.confirm || form.password.length < 6}
          >
            {loading ? '⌛ Resetting...' : '🔐 Reset Password'}
          </button>
        </form>

        <hr className="divider" />
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { loginSuccess } from '../store/slices/authSlice';
import styles from './Login.module.css';
import Logo from '../components/Logo';


function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(form);
      dispatch(loginSuccess(res.data.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.bg}></div>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      <div className={styles.container}>
        {/* LEFT SIDE */}
        <div className={styles.left}>
          <h1 className={styles.headline}>Manage your team,<br/>without the chaos.</h1>
          <p className={styles.subtitle}>Obsidian EMS gives you full visibility over your workforce.</p>

          <div className={styles.features}>
            <div className={styles.feature} style={{ animationDelay: '0.1s' }}>
              <div className={styles.featureDot}></div>
              Centralized Employee Directory
            </div>
            <div className={styles.feature} style={{ animationDelay: '0.2s' }}>
              <div className={styles.featureDot}></div>
              Smart Leave & Approval Workflows
            </div>
            <div className={styles.feature} style={{ animationDelay: '0.3s' }}>
              <div className={styles.featureDot}></div>
              Real-time Asset Tracking
            </div>
          </div>

          <div className={styles.wordmark}>
            i-SOFTZONE Technologies
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.right}>
          <div className={styles.card}>
            <div className={styles.logoWrapper}>
              <Logo size={48} />
              <div className={styles.brandName}>Obsidian EMS</div>
              <div className={styles.tagline}>Sign in to your workspace</div>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="your@isoftzone.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 500, textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                id="login-btn"
                className={styles.btn}
                disabled={loading}
              >
                {loading ? '⌛ Signing in...' : '🔐 Sign In'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

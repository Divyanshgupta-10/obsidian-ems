import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { employeeService } from '../services/employeeService';
import Layout from '../components/layout/Layout';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [me, lb] = await Promise.all([
          authService.me(),
          employeeService.leaveBalance(user?.id),
        ]);
        setProfile(me.data.data);
        setLeaveBalance(lb.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    if (user?.id) fetchProfile();
  }, [user]);

  if (loading) return <Layout title="Profile"><div className="loader-wrapper"><div className="spinner" /></div></Layout>;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <Layout title="My Profile" subtitle="View your account details">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user?.email}</p>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
            { label: 'Account Status', value: <span className="badge badge-approved">Active</span> },
            { label: 'Role', value: <span className={`badge badge-${user?.role}`}>{user?.role}</span> },
            { label: 'Employee ID', value: `#${String(user?.id).padStart(4,'0')}` },
          ].map(({ label, value }) => (
            <div className="card" key={label} style={{ padding: '1rem 1.25rem' }}>
              <div className="stat-label" style={{ marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {leaveBalance.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>🌴 Leave Balance (This Year)</h3></div>
            <div className="grid-3">
              {leaveBalance.map((lb) => (
                <div key={lb.leave_type} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div className="stat-label" style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>{lb.leave_type} Leave</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: lb.remaining > 3 ? 'var(--success)' : 'var(--warning)' }}>
                    {lb.remaining}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    remaining / {parseInt(lb.total_taken) + parseInt(lb.remaining)} total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Profile;

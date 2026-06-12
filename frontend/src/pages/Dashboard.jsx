import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import { leaveService } from '../services/leaveService';
import Layout from '../components/layout/Layout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import statStyles from './StatCard.module.css';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const statCards = (stats) => [
  { label: 'Total Employees', value: stats.totalEmployees ?? '—', icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { label: 'Departments', value: stats.totalDepartments ?? '—', icon: '🏢', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { label: 'Pending Leaves', value: stats.leaveStats?.pending ?? 0, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Total Salary', value: stats.totalSalary ? `₹${(stats.totalSalary/1000).toFixed(0)}K` : '—', icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
];

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({});
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const r = await reportService.dashboard();
          setStats(r.data.data);
        }
        const lr = await leaveService.list({ limit: 5 });
        setRecentLeaves(lr.data.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  const leaveChartData = stats.leaveStats ? [
    { name: 'Pending', value: stats.leaveStats.pending || 0 },
    { name: 'Approved', value: stats.leaveStats.approved || 0 },
    { name: 'Rejected', value: stats.leaveStats.rejected || 0 },
  ] : [];

  // asset chart reserved for future use

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="loader-wrapper"><div className="spinner" /></div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name}!`}>
      {/* Stat Cards */}
      {isAdmin && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {statCards(stats).map((s, i) => (
            <div className={statStyles.card} key={i} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={statStyles.header}>
                <div className={statStyles.icon} style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              </div>
              <div>
                <div className={statStyles.number}>{s.value}</div>
                <div className={statStyles.label}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {isAdmin && (
        <div className="grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          {/* Department Bar Chart */}
          <div className="card">
            <div className="card-header">
              <h3>👥 Department Headcount</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.departmentStats || []} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="department_name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="total" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Pie Chart */}
          <div className="card">
            <div className="card-header">
              <h3>🌴 Leave Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leaveChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {leaveChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Hiring Trend */}
      {isAdmin && stats.monthlyHires?.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header"><h3>📈 Monthly Hiring Trend</h3></div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats.monthlyHires}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Leaves */}
      <div className="card">
        <div className="card-header">
          <h3>🌴 Recent Leave Requests</h3>
          <Link to="/leaves" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {recentLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No leave requests</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>{l.employee_name || user?.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                    <td>{new Date(l.start_date).toLocaleDateString()}</td>
                    <td>{new Date(l.end_date).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;

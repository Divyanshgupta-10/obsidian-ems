import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { leaveService } from '../../services/leaveService';
import Layout from '../../components/layout/Layout';

function LeaveForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const days = form.start_date && form.end_date
    ? Math.round((new Date(form.end_date) - new Date(form.start_date)) / (1000*60*60*24)) + 1
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (days <= 0) { setError('End date must be after start date'); return; }
    setLoading(true);
    setError('');
    try {
      await leaveService.apply(form);
      navigate('/leaves');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? errors.join(', ') : err.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Apply for Leave" subtitle="Submit a leave request">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="page-header">
          <h2 className="page-title">🌴 Apply for Leave</h2>
          <Link to="/leaves" className="btn btn-secondary">← Back</Link>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Type *</label>
              <select name="leave_type" className="form-control" value={form.leave_type} onChange={handleChange} required>
                <option value="sick">🤒 Sick Leave</option>
                <option value="casual">🎯 Casual Leave</option>
                <option value="earned">💼 Earned Leave</option>
                <option value="maternity">👶 Maternity Leave</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input name="start_date" type="date" className="form-control" value={form.start_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input name="end_date" type="date" className="form-control" value={form.end_date} min={form.start_date} onChange={handleChange} required />
              </div>
            </div>

            {days > 0 && (
              <div className="alert alert-info">📅 Duration: <strong>{days} day{days !== 1 ? 's' : ''}</strong></div>
            )}

            <div className="form-group">
              <label className="form-label">Reason *</label>
              <textarea name="reason" className="form-control" placeholder="Please provide a reason for your leave..." rows={4} value={form.reason} onChange={handleChange} required style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Link to="/leaves" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⌛ Submitting...' : '📤 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default LeaveForm;

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { leaveService } from '../../services/leaveService';
import Layout from '../../components/layout/Layout';

function LeaveList() {
  const { user, isAdmin, isManager } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveService.list({ page, limit, status: statusFilter || undefined });
      setLeaves(res.data.data.data || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (_) {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'approve') await leaveService.approve(id);
      else await leaveService.reject(id);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout title="Leave Management" subtitle="View and manage leave requests">
      <div className="page-header">
        <div>
          <h2 className="page-title">🌴 Leave Requests</h2>
          <p className="page-desc">{total} total requests</p>
        </div>
        <Link to="/leaves/apply" className="btn btn-primary">➕ Apply Leave</Link>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No leave requests found</div>
            <Link to="/leaves/apply" className="btn btn-primary" style={{ marginTop: '1rem' }}>Apply for Leave</Link>
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
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {(isAdmin || isManager) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const days = Math.round((new Date(l.end_date) - new Date(l.start_date)) / (1000*60*60*24)) + 1;
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.employee_name || user?.name}</td>
                      <td><span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{l.leave_type}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(l.start_date).toLocaleDateString()}</td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(l.end_date).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{days}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                      <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                      {(isAdmin || isManager) && (
                        <td>
                          {l.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAction(l.id, 'approve')}
                                disabled={actionLoading === l.id}
                              >✅ Approve</button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAction(l.id, 'reject')}
                                disabled={actionLoading === l.id}
                              >❌ Reject</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {l.approved_by_name ? `by ${l.approved_by_name}` : '—'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LeaveList;

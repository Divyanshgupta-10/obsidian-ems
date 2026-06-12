import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assetService } from '../../services/assetService';
import { employeeService } from '../../services/employeeService';
import Layout from '../../components/layout/Layout';

function AssetList() {
  const { isAdmin, isManager } = useAuth();
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [allocateModal, setAllocateModal] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allocateEmp, setAllocateEmp] = useState('');
  const [allocating, setAllocating] = useState(false);
  const limit = 10;

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assetService.list({ page, limit, status: statusFilter || undefined });
      setAssets(res.data.data.data || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (_) {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const openAllocate = async (asset) => {
    setAllocateModal(asset);
    setAllocateEmp('');
    try {
      const res = await employeeService.list({ limit: 100 });
      setEmployees(res.data.data.data || []);
    } catch (_) {}
  };

  const handleAllocate = async () => {
    if (!allocateEmp) return;
    setAllocating(true);
    try {
      await assetService.allocate(allocateModal.id, { employee_id: parseInt(allocateEmp) });
      setAllocateModal(null);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
    setAllocating(false);
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this asset as returned?')) return;
    try {
      await assetService.returnAsset(id);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout title="Asset Management" subtitle="Track and manage company assets">
      <div className="page-header">
        <div>
          <h2 className="page-title">🖥️ Asset Inventory</h2>
          <p className="page-desc">{total} assets in total</p>
        </div>
        {isAdmin && <Link to="/assets/new" className="btn btn-primary">➕ Add Asset</Link>}
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="allocated">Allocated</option>
          <option value="damaged">Damaged</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🖥️</div>
            <div className="empty-state-title">No assets found</div>
            {isAdmin && <Link to="/assets/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add First Asset</Link>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id}>
                    <td><code style={{ background: 'var(--bg-elevated)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>{a.asset_code}</code></td>
                    <td style={{ fontWeight: 500 }}>{a.asset_name}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{a.asset_type}</td>
                    <td>{a.purchase_cost ? `₹${Number(a.purchase_cost).toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>{a.assigned_to || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {a.status === 'available' && (isAdmin || isManager) && (
                          <button className="btn btn-primary btn-sm" onClick={() => openAllocate(a)}>📤 Allocate</button>
                        )}
                        {a.status === 'allocated' && (isAdmin || isManager) && (
                          <button className="btn btn-warning btn-sm" onClick={() => handleReturn(a.id)}>📥 Return</button>
                        )}
                        {isAdmin && <Link to={`/assets/${a.id}/edit`} className="btn btn-secondary btn-sm btn-icon">✏️</Link>}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Allocate Modal */}
      {allocateModal && (
        <div className="modal-overlay" onClick={() => setAllocateModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Allocate Asset</h3>
              <button onClick={() => setAllocateModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">🖥️ Allocating: <strong>{allocateModal.asset_name}</strong> ({allocateModal.asset_code})</div>
              <div className="form-group">
                <label className="form-label">Select Employee *</label>
                <select className="form-control" value={allocateEmp} onChange={(e) => setAllocateEmp(e.target.value)}>
                  <option value="">Choose employee...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.designation || e.role}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAllocateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAllocate} disabled={!allocateEmp || allocating}>
                {allocating ? '⌛ Allocating...' : '📤 Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AssetList;

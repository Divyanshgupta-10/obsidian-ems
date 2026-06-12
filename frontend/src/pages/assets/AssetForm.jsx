import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import Layout from '../../components/layout/Layout';

function AssetForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ asset_code: '', asset_name: '', asset_type: '', purchase_date: '', purchase_cost: '', status: 'available' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      assetService.get(id).then((r) => {
        const a = r.data.data;
        setForm({ asset_code: a.asset_code || '', asset_name: a.asset_name || '', asset_type: a.asset_type || '', purchase_date: a.purchase_date ? a.purchase_date.split('T')[0] : '', purchase_cost: a.purchase_cost || '', status: a.status || 'available' });
      }).catch(() => setError('Failed to load asset')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { ...form };
      if (!data.purchase_cost) delete data.purchase_cost;
      if (!data.purchase_date) delete data.purchase_date;
      if (isEdit) await assetService.update(id, data);
      else await assetService.create(data);
      navigate('/assets');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? errors.join(', ') : err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  if (fetching) return <Layout title="Asset"><div className="loader-wrapper"><div className="spinner" /></div></Layout>;

  return (
    <Layout title={isEdit ? 'Edit Asset' : 'New Asset'}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="page-header">
          <h2 className="page-title">{isEdit ? '✏️ Edit Asset' : '➕ New Asset'}</h2>
          <Link to="/assets" className="btn btn-secondary">← Back</Link>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Asset Code *</label>
                <input name="asset_code" className="form-control" placeholder="LT-001" value={form.asset_code} onChange={handleChange} required disabled={isEdit} />
              </div>
              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input name="asset_name" className="form-control" placeholder="Dell Latitude 5520" value={form.asset_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select name="asset_type" className="form-control" value={form.asset_type} onChange={handleChange} required>
                  <option value="">Select type</option>
                  <option value="laptop">💻 Laptop</option>
                  <option value="monitor">🖥️ Monitor</option>
                  <option value="mouse">🖱️ Mouse</option>
                  <option value="keyboard">⌨️ Keyboard</option>
                  <option value="id_card">🪪 ID Card</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input name="purchase_date" type="date" className="form-control" value={form.purchase_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Cost (₹)</label>
                <input name="purchase_cost" type="number" className="form-control" placeholder="75000" value={form.purchase_cost} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Link to="/assets" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '⌛ Saving...' : isEdit ? '💾 Update' : '✅ Create Asset'}</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AssetForm;

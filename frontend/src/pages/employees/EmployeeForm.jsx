import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import Layout from '../../components/layout/Layout';
import styles from './EmployeeForm.module.css';

function EmployeeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee',
    department_id: '', designation: '', salary: '', phone: '', address: '', joining_date: '',
    skills: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      employeeService.departments().then(r => setDepartments(r.data.data || [])).catch(() => {}),
      employeeService.getAllSkills().then(r => setAvailableSkills(r.data.data || [])).catch(() => {})
    ]);

    if (isEdit) {
      employeeService.get(id)
        .then((r) => {
          const emp = r.data.data;
          setForm({
            name: emp.name || '',
            email: emp.email || '',
            password: '',
            role: emp.role || 'employee',
            department_id: emp.department_id || '',
            designation: emp.designation || '',
            salary: emp.salary || '',
            phone: emp.phone || '',
            address: emp.address || '',
            joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
            skills: emp.skills?.map(s => s.id) || []
          });
          setExistingImages(emp.images || []);
        })
        .catch(() => setError('Failed to load employee'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSkill = (skillId) => {
    setForm(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (!data.department_id) delete data.department_id;
      if (!data.salary) delete data.salary;

      let savedEmployee;
      if (isEdit) {
        savedEmployee = (await employeeService.update(id, data)).data.data;
      } else {
        savedEmployee = (await employeeService.create(data)).data.data;
      }

      // Upload Images if any selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('images', file));
        await employeeService.uploadImages(savedEmployee.id || savedEmployee.profile_id || id, formData);
      }

      navigate('/employees');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? errors.join(', ') : err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout title={isEdit ? 'Edit Employee' : 'Add Employee'}><div className="loader-wrapper"><div className="spinner" /></div></Layout>;

  return (
    <Layout title={isEdit ? 'Edit Employee' : 'Add Employee'} subtitle={isEdit ? 'Update employee details' : 'Create a new employee account'}>
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '40px' }}>
        <div className="page-header">
          <div>
            <h2 className="page-title">{isEdit ? '✏️ Edit Employee' : '➕ New Employee'}</h2>
          </div>
          <Link to="/employees" className="btn btn-secondary">← Back</Link>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h4>👤 Basic Information</h4></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input name="email" type="email" className="form-control" placeholder="john@company.com" value={form.email} onChange={handleChange} required={!isEdit} />
              </div>
              <div className="form-group">
                <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input name="password" type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required={!isEdit} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h4>🏢 Job Details</h4></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department_id" className="form-control" value={form.department_id} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input name="designation" className="form-control" placeholder="React Developer" value={form.designation} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Salary (₹)</label>
                <input name="salary" type="number" className="form-control" placeholder="50000" value={form.salary} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input name="joining_date" type="date" className="form-control" value={form.joining_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-control" placeholder="9876543210" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <textarea name="address" className="form-control" placeholder="City, State" rows={2} value={form.address} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Skills Assignment */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h4>🎯 Professional Skills</h4></div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>Select the skills associated with this employee.</div>
            <div className={styles.skillsGrid}>
              {availableSkills.map((skill) => (
                <div 
                  key={skill.id} 
                  className={`${styles.skillChip} ${form.skills.includes(skill.id) ? styles.active : ''}`}
                  onClick={() => toggleSkill(skill.id)}
                >
                  {form.skills.includes(skill.id) && <span style={{marginRight: '6px'}}>✓</span>}
                  {skill.name}
                </div>
              ))}
              {availableSkills.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>No skills found in database.</div>}
            </div>
          </div>

          {/* Multiple Image Uploads (Disabled in production due to Vercel Serverless limitations) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header"><h4>🖼️ Employee Documents & Images</h4></div>
              
              <div className={styles.fileInputWrapper} onClick={() => fileInputRef.current?.click()}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to browse or drag & drop</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>Upload profile pictures, ID cards, or certificates (JPEG, PNG, WEBP)</div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleFileChange}
                />
              </div>

              {/* Selected files preview before upload */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-2)' }}>Ready to upload:</h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedFiles.map((f, i) => (
                      <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--primary)' }}>📄 {f.name}</span>
                        <button type="button" onClick={() => removeSelectedFile(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing uploaded images */}
              {isEdit && existingImages.length > 0 && (
                <div>
                  <h5 style={{ margin: '16px 0 8px 0', fontSize: '12px', color: 'var(--text-2)' }}>Uploaded Files:</h5>
                  <div className={styles.galleryGrid}>
                    {existingImages.map((img) => (
                      <div key={img.id} className={styles.imageCard}>
                        {/* Backend is running on port 5000, we prepend the API base URL's origin */}
                        <img src={`http://localhost:5000/${img.filepath}`} alt={img.filename} />
                        <div className={styles.imageLabel}>{img.filename}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Link to="/employees" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⌛ Saving...' : isEdit ? '💾 Update Employee' : '✅ Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EmployeeForm;

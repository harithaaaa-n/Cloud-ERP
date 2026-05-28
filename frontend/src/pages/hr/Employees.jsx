import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Mail, Phone, Calendar, Loader2, Trash2, Edit2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#22d3ee,#6366f1)',
  'linear-gradient(135deg,#10b981,#22d3ee)',
  'linear-gradient(135deg,#f59e0b,#f43f5e)',
  'linear-gradient(135deg,#8b5cf6,#f43f5e)',
];

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [view, setView] = useState('grid'); // 'grid' | 'table'
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null for Add, ID for Edit

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Technology',
    role: '',
    salary: '',
    status: 'Active',
    bio: '',
    address: '',
    skills: '',
    profileImage: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search,
        department: deptFilter,
        status: statusFilter,
        page,
        limit: 8
      };
      const res = await api.hr.getEmployees(params);
      if (res.success) {
        setEmployees(res.data);
        setTotalPages(res.pagination.pages || 1);
        setTotalRecords(res.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter, page]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (emp) => {
    setEditingId(emp._id);
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Technology',
      role: emp.role || '',
      salary: emp.salary || '',
      status: emp.status || 'Active',
      bio: emp.bio || '',
      address: emp.address || '',
      skills: emp.skills ? emp.skills.join(', ') : '',
      profileImage: emp.profileImage || '',
    });
    setShowModal(true);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      department: 'Technology',
      role: '',
      salary: '',
      status: 'Active',
      bio: '',
      address: '',
      skills: '',
      profileImage: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role || !form.salary) {
      showToast('Please fill in name, email, designation, and salary.', 'error');
      return;
    }

    const payload = {
      ...form,
      salary: Number(form.salary),
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      setSubmitting(true);
      if (editingId) {
        // Edit flow
        const res = await api.hr.updateEmployee(editingId, payload);
        if (res.success) {
          showToast('Employee updated successfully!');
          fetchEmployees();
          setShowModal(false);
        }
      } else {
        // Add flow
        const res = await api.hr.createEmployee(payload);
        if (res.success) {
          showToast('Employee registered successfully!');
          fetchEmployees();
          setShowModal(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit employee data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee? This will purge all associated attendance, leave, and salary logs.')) return;
    try {
      const res = await api.hr.deleteEmployee(id);
      if (res.success) {
        showToast('Employee and all related logs purged successfully.');
        fetchEmployees();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1100,
              padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: 600,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              background: toast.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage corporate personnel profile sheets, logs and pay slips.</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('grid')}>Grid</button>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
          <button className="btn btn-primary" id="hr-add-employee-btn" onClick={handleAddNewClick}>
            <Plus size={15} /> Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* Filters Area */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="header-search" style={{ flex: '1 1 280px', maxWidth: 'none', margin: 0 }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            placeholder="Search by name, designation, or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <div>
            <select className="form-select" style={{ padding: '8px 12px', fontSize: 13 }} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="All">All Departments</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div>
            <select className="form-select" style={{ padding: '8px 12px', fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
          <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading Employee directory...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>No employees found matching filter criteria.</span>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {view === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {employees.map((emp, i) => (
                <motion.div
                  key={emp._id}
                  className="glass-card glass-card-hover"
                  style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div>
                    <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: avatarColors[i % avatarColors.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                          {getInitials(emp.name)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{emp.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{emp.role}</div>
                      </div>
                    </div>
                    
                    <div className="divider" style={{ margin: '12px 0' }} />
                    
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Mail size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Phone size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emp.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Calendar size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Joined: {new Date(emp.joinDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                      <span className="badge badge-gray">{emp.department}</span>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : emp.status === 'On Leave' ? 'badge-amber' : 'badge-danger'}`}>{emp.status}</span>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm flex-1" style={{ fontSize: 12 }} onClick={() => navigate(`/hr/profiles?id=${emp._id}`)}>
                        <User size={13} style={{ marginRight: 4 }} /> View Profile
                      </button>
                      <button className="icon-btn btn-sm" style={{ border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }} onClick={() => handleEditClick(emp)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="icon-btn btn-sm" style={{ border: 'none', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)' }} onClick={() => handleDelete(emp._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Table View */}
          {view === 'table' && (
            <div className="glass-card">
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr><th>Employee</th><th>Role</th><th>Department</th><th>Joined</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={emp._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {emp.profileImage ? (
                              <img src={emp.profileImage} alt={emp.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: avatarColors[i % avatarColors.length],
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                              }}>{getInitials(emp.name)}</div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{emp.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{emp.role}</td>
                        <td><span className="badge badge-gray">{emp.department}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(emp.joinDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontWeight: 600 }}>₹{emp.salary.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${emp.status === 'Active' ? 'badge-success' : emp.status === 'On Leave' ? 'badge-amber' : 'badge-danger'}`}>{emp.status}</span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate(`/hr/profiles?id=${emp._id}`)}>Profile</button>
                            <button className="btn btn-sm btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleEditClick(emp)}>Edit</button>
                            <button className="btn btn-sm btn-danger" style={{ background: 'rgba(244,63,94,0.1)', border: 'none', color: 'var(--accent-rose)', padding: '4px 8px', fontSize: 11 }} onClick={() => handleDelete(emp._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between" style={{ marginTop: 24, padding: '0 8px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {employees.length} of {totalRecords} records
            </span>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="flex items-center justify-center text-sm" style={{ padding: '0 12px', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-sm btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Employee Record' : 'Add New Employee'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Verma" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="rahul@company.com" disabled={!!editingId} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91-9988776655" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation / Role</label>
                    <input className="form-input" name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Software Engineer" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input className="form-input" name="salary" type="number" value={form.salary} onChange={handleChange} required placeholder="e.g. 50000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Image URL</label>
                  <input className="form-input" name="profileImage" value={form.profileImage} onChange={handleChange} placeholder="https://images.unsplash.com/... or base64 data" />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input className="form-input" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB, Express" />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea className="form-input" name="address" rows={2} value={form.address} onChange={handleChange} placeholder="Street Name, Area, City" />
                </div>

                <div className="form-group">
                  <label className="form-label">Personal Biography</label>
                  <textarea className="form-input" name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Brief summary of professional experiences and qualifications..." />
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" id="hr-submit-employee-btn">
                    {submitting ? 'Saving...' : editingId ? 'Update Record' : 'Register Employee'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

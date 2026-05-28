import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Mail, Phone, Search, Loader2, Star, ShieldAlert, 
  Trash2, Edit2, TrendingUp, DollarSign, Calendar, Layers, MapPin, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../utils/api';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function SupplyChain() {
  // Tabs: 'directory' or 'analytics'
  const [activeTab, setActiveTab] = useState('directory');

  // Datasets
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // States
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Form
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    taxId: '',
    paymentTerms: 'Net 30',
    status: 'Active',
    rating: '5',
    leadTime: '5',
    type: 'Supplier',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        type: 'Supplier',
        search,
        status: statusFilter !== 'All' ? statusFilter : undefined
      };
      const res = await api.supply.getContacts(params);
      if (res.success) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load supplier directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.supply.getSupplierAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load supplier analytics.', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.name || !form.email) {
      showToast('Company, Name, and Email are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        rating: Number(form.rating) || 5,
        leadTime: Number(form.leadTime) || 5
      };

      let res;
      if (selectedContact) {
        res = await api.supply.updateContact(selectedContact._id, payload);
      } else {
        res = await api.supply.createContact(payload);
      }

      if (res.success) {
        showToast(selectedContact ? 'Supplier details updated.' : 'Supplier registered successfully.');
        setShowModal(false);
        setSelectedContact(null);
        fetchContacts();
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier contact?')) return;
    try {
      const res = await api.supply.deleteContact(id);
      if (res.success) {
        showToast('Supplier deleted successfully.');
        fetchContacts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete supplier.', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedContact(null);
    setForm({
      company: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      taxId: '',
      paymentTerms: 'Net 30',
      status: 'Active',
      rating: '5',
      leadTime: '5',
      type: 'Supplier',
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setSelectedContact(s);
    setForm({
      company: s.company || '',
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      contactPerson: s.contactPerson || '',
      taxId: s.taxId || '',
      paymentTerms: s.paymentTerms || 'Net 30',
      status: s.status || 'Active',
      rating: (s.rating || 5).toString(),
      leadTime: (s.leadTime || 5).toString(),
      type: 'Supplier',
    });
    setShowModal(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          fill={i <= rating ? "var(--accent-amber)" : "none"} 
          stroke={i <= rating ? "var(--accent-amber)" : "var(--text-muted)"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <div className="flex">{stars}</div>;
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
          <h1 className="page-title">Procurement & Vendors</h1>
          <p className="page-subtitle">Manage supply chains, lead times, vendor ratings, payment terms, and aggregate spent performance.</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('directory')}>
            <Layers size={14} style={{ marginRight: 4 }} /> Supplier Directory
          </button>
          <button className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')}>
            <TrendingUp size={14} style={{ marginRight: 4 }} /> SCM Analytics
          </button>
          <button className="btn btn-primary btn-sm" id="supply-add-supplier-btn" onClick={openAddModal}>
            <Plus size={14} /> Add Supplier
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* ── TAB 1: Suppliers Directory ─────────────────────────────── */}
      {activeTab === 'directory' && (
        <>
          {/* Quick Filters */}
          <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="header-search" style={{ flex: '1 1 280px', maxWidth: 'none', margin: 0 }}>
              <Search size={15} color="var(--text-muted)" />
              <input 
                placeholder="Search suppliers by company, name, tax ID..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <div className="flex gap-3">
              <select className="form-select" style={{ padding: '8px 12px', fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fetching vendor directory...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>No vendors found matching search queries.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
              {contacts.map((sup, i) => (
                <motion.div
                  key={sup._id}
                  className="glass-card glass-card-hover"
                  style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                      <span className="badge badge-gray">{sup.paymentTerms}</span>
                      <span className={`badge ${
                        sup.status === 'Active' ? 'badge-success' :
                        sup.status === 'Inactive' ? 'badge-gray' : 'badge-danger'
                      }`}>{sup.status}</span>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px 0' }}>{sup.company || 'Private Vendor'}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 12 }}>
                      Contact: <strong>{sup.name}</strong> {sup.contactPerson ? `(${sup.contactPerson})` : ''}
                    </div>

                    <div className="divider" style={{ margin: '12px 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Delivery Time</span>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{sup.leadTime} Days</div>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tax Registration ID</span>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, fontFamily: 'monospace' }}>{sup.taxId || 'N/A'}</div>
                      </div>
                      <div className="col-span-2">
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Supplier Rating</span>
                        {renderStars(sup.rating)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                      <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Mail size={13} color="var(--text-muted)" />
                        <span>{sup.email}</span>
                      </div>
                      <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{sup.phone || 'No phone registered'}</span>
                      </div>
                      {sup.address && (
                        <div className="flex items-start gap-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          <MapPin size={13} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{sup.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm flex-1" style={{ fontSize: 12 }} onClick={() => openEditModal(sup)}>
                        <Edit2 size={13} style={{ marginRight: 4 }} /> Edit Vendor
                      </button>
                      <button className="icon-btn btn-sm" style={{ border: 'none', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)' }} onClick={() => handleDelete(sup._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: SCM Analytics ──────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <>
          {analyticsLoading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: 12 }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aggregating supplier KPIs...</span>
            </div>
          ) : !analytics ? (
            <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Failed to aggregate supply chain metrics.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* KPIs summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Registered Suppliers', value: analytics.summary.totalSuppliers, color: 'var(--accent-primary)' },
                  { label: 'Active SCM Partners', value: analytics.summary.activeSuppliers, color: 'var(--accent-cyan)' },
                  { label: 'Total SCM Spent (Completed)', value: fmt(analytics.summary.totalSpent), color: 'var(--accent-emerald)' },
                  { label: 'Pending Purchase Orders', value: analytics.summary.pendingOrdersCount, color: 'var(--accent-amber)' },
                ].map((s, i) => (
                  <motion.div key={i} className="glass-card" style={{ padding: 24 }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Analytics Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Spend per Supplier */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 className="section-title"><Award size={16} style={{ display: 'inline', marginRight: 6 }} /> Spend Distribution by Supplier (Completed Orders)</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.supplierSpendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} formatter={v => fmt(v)} />
                        <Bar dataKey="amount" name="Total Spent Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 className="section-title"><Star size={16} style={{ display: 'inline', marginRight: 6 }} /> Supplier Performance Ratings</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.supplierSpendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 5]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                        <Bar dataKey="rating" name="Rating (1-5)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Supplier Modal ─────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedContact ? 'Modify Supplier Details' : 'Register New Supplier'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input className="form-input" name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Semiconductor Tech Ltd" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Email *</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="contact@supplier.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Contact Person Name *</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Robert Downy" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person Position</label>
                    <input className="form-input" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="e.g. Sales Manager" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91-XXXXXXXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax ID / GSTIN</label>
                    <input className="form-input" name="taxId" value={form.taxId} onChange={handleChange} placeholder="GSTINXXXXXXXXX" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <select className="form-select" name="paymentTerms" value={form.paymentTerms} onChange={handleChange}>
                      <option value="Immediate">Immediate</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lead Time (Days)</label>
                    <input className="form-input" type="number" min="0" name="leadTime" value={form.leadTime} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operational Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Performance Rating (1-5)</label>
                  <select className="form-select" name="rating" value={form.rating} onChange={handleChange}>
                    <option value="5">⭐️⭐️⭐️⭐️⭐️ (5/5)</option>
                    <option value="4">⭐️⭐️⭐️⭐️ (4/5)</option>
                    <option value="3">⭐️⭐️⭐️ (3/5)</option>
                    <option value="2">⭐️⭐️ (2/5)</option>
                    <option value="1">⭐️ (1/5)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Office Location Address</label>
                  <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Full postal address..." />
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : selectedContact ? 'Update Supplier' : 'Register Supplier'}
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

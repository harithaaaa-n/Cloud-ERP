import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Plus, Search, Package, Loader2, Trash2, Edit2,
  TrendingUp, Download, Eye, Layers, History, Settings2, BarChart3, Tag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../utils/api';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

// Helper: Custom styled striped barcode component for visuals
function SimulatedBarcode({ code }) {
  const bars = code ? code.split('').map(Number) : [1,2,3,4,1,2,3,4,1,2];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: 8, width: 'max-content', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', height: 42, alignItems: 'stretch', gap: 1 }}>
        {bars.map((b, idx) => (
          <div
            key={idx}
            style={{
              width: b % 3 === 0 ? 3 : b % 2 === 0 ? 2 : 1,
              background: 'black',
              marginRight: idx % 4 === 0 ? 1 : 0
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', letterSpacing: 3, marginTop: 4, fontWeight: 700 }}>
        {code || '89012345678'}
      </span>
    </div>
  );
}

export default function Inventory() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'analytics'

  // Datasets
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filtering / Pagination states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // For adjust/view details

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Electronics',
    stock: '',
    price: '',
    costPrice: '',
    minStock: '10',
    unit: 'pcs',
    location: '',
    description: '',
    supplier: '',
  });

  const [adjustForm, setAdjustForm] = useState({
    type: 'Stock In',
    quantityChanged: '',
    reference: '',
    notes: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search,
        category: categoryFilter,
        status: statusFilter,
        page,
        limit: 8,
      };

      const res = await api.inventory.getProducts(params);
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination.pages || 1);
        setTotalRecords(res.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory dataset.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsAndLogs = async () => {
    try {
      setAnalyticsLoading(true);
      const [analyticsRes, logsRes] = await Promise.all([
        api.inventory.getAnalytics(),
        api.inventory.getLogs()
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch analytics metrics.', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSuppliersList = async () => {
    try {
      const res = await api.supply.getContacts();
      if (res.success) {
        setSuppliers(res.data.filter(c => c.type === 'Supplier'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsAndLogs();
    }
  }, [activeTab]);

  // CRUD Actions
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.costPrice) {
      showToast('Please fill in Name, Retail Price, and Cost Price.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...productForm,
        stock: Number(productForm.stock) || 0,
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice),
        minStock: Number(productForm.minStock) || 10,
        supplier: productForm.supplier || null
      };

      let res;
      if (selectedProduct && !showAdjustModal) {
        res = await api.inventory.updateProduct(selectedProduct._id, payload);
      } else {
        res = await api.inventory.createProduct(payload);
      }

      if (res.success) {
        showToast(selectedProduct ? 'Product updated successfully.' : 'Product registered successfully.');
        setShowProductModal(false);
        setSelectedProduct(null);
        fetchInventoryData();
      }
    } catch (err) {
      showToast(err.message || 'Product action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustForm.quantityChanged) {
      showToast('Please enter an adjustment quantity.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.inventory.adjustStock(selectedProduct._id, {
        ...adjustForm,
        quantityChanged: Number(adjustForm.quantityChanged)
      });

      if (res.success) {
        showToast('Stock adjusted successfully.');
        setShowAdjustModal(false);
        setSelectedProduct(null);
        fetchInventoryData();
        setAdjustForm({ type: 'Stock In', quantityChanged: '', reference: '', notes: '' });
      }
    } catch (err) {
      showToast(err.message || 'Stock adjustment failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This will also wipe its transaction logs.')) return;
    try {
      const res = await api.inventory.deleteProduct(id);
      if (res.success) {
        showToast('Product purged successfully.');
        fetchInventoryData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setProductForm({
      name: '',
      sku: '',
      barcode: '',
      category: 'Electronics',
      stock: '0',
      price: '',
      costPrice: '',
      minStock: '10',
      unit: 'pcs',
      location: '',
      description: '',
      supplier: '',
    });
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setSelectedProduct(p);
    setProductForm({
      name: p.name || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      category: p.category || 'Electronics',
      stock: p.stock.toString(),
      price: p.price.toString(),
      costPrice: p.costPrice ? p.costPrice.toString() : '0',
      minStock: p.minStock ? p.minStock.toString() : '10',
      unit: p.unit || 'pcs',
      location: p.location || '',
      description: p.description || '',
      supplier: p.supplier?._id || p.supplier || '',
    });
    setShowProductModal(true);
  };

  const openAdjustModal = (p) => {
    setSelectedProduct(p);
    setShowAdjustModal(true);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { label: 'Out of Stock', badge: 'badge-danger' };
    if (stock < minStock) return { label: 'Low Stock', badge: 'badge-warning' };
    return { label: 'In Stock', badge: 'badge-success' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
      
      {/* Toast Overlay */}
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
          <h1 className="page-title">Procurement & Inventory</h1>
          <p className="page-subtitle">Track hardware counts, SKU labels, barcodes, minimum stock thresholds, and transaction ledgers.</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('list')}>
            <Layers size={14} style={{ marginRight: 4 }} /> Stock Catalog
          </button>
          <button className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={14} style={{ marginRight: 4 }} /> Analytics & History
          </button>
          <button className="btn btn-primary btn-sm" id="inventory-add-btn" onClick={openAddModal}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* ── TAB 1: Stock List View ─────────────────────────────────── */}
      {activeTab === 'list' && (
        <>
          {/* Quick stock warning banner if any items are under minimum */}
          {products.some(p => p.stock < p.minStock) && (
            <motion.div
              className="glass-card"
              style={{ padding: '14px 20px', marginBottom: 24, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} color="var(--accent-amber)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Attention: Some catalog items have fallen below minimum warning stock thresholds.</span>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setStatusFilter('Low Stock')}>Filter Low Stock</button>
            </motion.div>
          )}

          {/* Filters Panel */}
          <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="header-search" style={{ flex: '1 1 280px', maxWidth: 'none', margin: 0 }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                placeholder="Search by name, SKU, or EAN barcode..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              <div>
                <select className="form-select" style={{ padding: '8px 12px', fontSize: 13 }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Storage">Storage</option>
                  <option value="Display">Display</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Networking">Networking</option>
                  <option value="Software">Software</option>
                </select>
              </div>
              <div>
                <select className="form-select" style={{ padding: '8px 12px', fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Levels</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock Warnings</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fetching catalog index...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>No products found matching filters.</span>
            </div>
          ) : (
            <>
              {/* Product catalog Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {products.map((p, i) => {
                  const status = getStockStatus(p.stock, p.minStock);
                  return (
                    <motion.div
                      key={p._id}
                      className="glass-card glass-card-hover"
                      style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                          <span className="badge badge-gray">{p.category}</span>
                          <span className={`badge ${status.badge}`}>{status.label}</span>
                        </div>

                        <div className="flex gap-3" style={{ marginBottom: 14 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8, background: 'var(--bg-elevated)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <Package size={20} color="var(--text-secondary)" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px 0' }}>{p.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted">
                              <span>SKU: <strong>{p.sku}</strong></span>
                              {p.location && <span>· Rack: {p.location}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="divider" style={{ margin: '12px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Warehouse Stock</span>
                            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: p.stock < p.minStock ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                              {p.stock} {p.unit}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Retail Price</span>
                            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{fmt(p.price)}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unit Cost Price</span>
                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: 'var(--text-secondary)' }}>{fmt(p.costPrice || 0)}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Value</span>
                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: 'var(--text-secondary)' }}>{fmt(p.stock * p.price)}</div>
                          </div>
                        </div>

                        {p.barcode && (
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                            <SimulatedBarcode code={p.barcode} />
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm flex-1" style={{ fontSize: 12 }} onClick={() => openAdjustModal(p)}>
                            <Settings2 size={13} style={{ marginRight: 4 }} /> Adjust Stock
                          </button>
                          <button className="icon-btn btn-sm" style={{ border: 'none', background: 'var(--bg-elevated)' }} onClick={() => openEditModal(p)} title="Edit details">
                            <Edit2 size={13} />
                          </button>
                          <button className="icon-btn btn-sm" style={{ border: 'none', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)' }} onClick={() => handleDelete(p._id)} title="Purge product">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between" style={{ marginTop: 24, padding: '0 8px' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {products.length} of {totalRecords} unique items
                </span>
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <span className="flex items-center justify-center text-sm" style={{ padding: '0 12px', fontWeight: 600 }}>
                    Page {page} of {totalPages}
                  </span>
                  <button className="btn btn-sm btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB 2: Analytics & Logs ────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <>
          {analyticsLoading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: 12 }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aggregating procurement metrics...</span>
            </div>
          ) : !analytics ? (
            <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Failed to aggregate analytics metadata.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Analytics summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Catalog Products', value: analytics.summary.totalProducts, color: 'var(--accent-primary)' },
                  { label: 'Total Warehouse Stock Units', value: analytics.summary.totalStock.toLocaleString(), color: 'var(--accent-cyan)' },
                  { label: 'Total Valuation (Retail)', value: fmt(analytics.summary.totalRetailValue), color: 'var(--accent-emerald)' },
                  { label: 'Total Valuation (Cost)', value: fmt(analytics.summary.totalCostValue), color: 'var(--accent-rose)' },
                ].map((s, i) => (
                  <motion.div key={i} className="glass-card" style={{ padding: 24 }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts & Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Category Stock Distribution */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 className="section-title">Stock Quantity by Category</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                        <Bar dataKey="stock" name="Stock Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Value Distribution */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 className="section-title">Valuation Value by Category</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} formatter={v => fmt(v)} />
                        <Bar dataKey="retailValue" name="Retail Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Movement Logs History Ledger */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                  <h3 className="section-title" style={{ margin: 0 }}><History size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Inventory Audit Movements Ledger</h3>
                  <button className="btn btn-secondary btn-sm" onClick={fetchAnalyticsAndLogs}>Refresh Logs</button>
                </div>

                {logs.length === 0 ? (
                  <div style={{ padding: '24px 0', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>No stock movements recorded.</div>
                ) : (
                  <div className="table-wrapper" style={{ maxHeight: 350, overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr><th>Product</th><th>Type</th><th>Shift</th><th>Previous</th><th>New</th><th>User Tag</th><th>Reference</th><th>Notes</th><th>Timestamp</th></tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{log.product?.name || 'Unknown Product'}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>SKU: {log.product?.sku || '—'}</div>
                            </td>
                            <td>
                              <span className={`badge ${
                                log.type === 'Stock In' ? 'badge-success' :
                                log.type === 'Stock Out' ? 'badge-danger' : 'badge-amber'
                              }`} style={{ fontSize: 11 }}>{log.type}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: log.quantityChanged >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                              {log.quantityChanged >= 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                            </td>
                            <td style={{ fontSize: 13 }}>{log.previousStock}</td>
                            <td style={{ fontSize: 13, fontWeight: 600 }}>{log.newStock}</td>
                            <td style={{ fontSize: 12 }}>
                              <div style={{ fontWeight: 500 }}>{log.user?.name || 'System'}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.user?.role || '—'}</div>
                            </td>
                            <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{log.reference}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.notes}>{log.notes || '—'}</td>
                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Product Modal ───────────────────────────────── */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedProduct ? 'Update Product Details' : 'Register New Product'}</h3>
              <button className="icon-btn" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="flex flex-col gap-4" style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
                
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" name="name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required placeholder="e.g. ASUS ROG Strix GPU" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">SKU (Auto-generates if empty)</label>
                    <input className="form-input" name="sku" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} placeholder="e.g. DISP-ASUS-101" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EAN Barcode Number (Auto-generates if empty)</label>
                    <input className="form-input" name="barcode" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} placeholder="890XXXXXXXX" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" name="category" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                      <option value="Electronics">Electronics</option>
                      <option value="Storage">Storage</option>
                      <option value="Display">Display</option>
                      <option value="Peripherals">Peripherals</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Networking">Networking</option>
                      <option value="Software">Software</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Warning Level</label>
                    <input className="form-input" type="number" name="minStock" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: e.target.value })} placeholder="10" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Measurement Unit</label>
                    <input className="form-input" name="unit" value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} placeholder="pcs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Retail Price (₹) *</label>
                    <input className="form-input" type="number" name="price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost Price (₹) *</label>
                    <input className="form-input" type="number" name="costPrice" value={productForm.costPrice} onChange={e => setProductForm({ ...productForm, costPrice: e.target.value })} required placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Starting Stock Quantity</label>
                    <input className="form-input" type="number" name="stock" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} disabled={!!selectedProduct} placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Procurement Supplier</label>
                    <select className="form-select" name="supplier" value={productForm.supplier} onChange={e => setProductForm({ ...productForm, supplier: e.target.value })}>
                      <option value="">-- No Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.company} ({s.name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warehouse Rack Location</label>
                    <input className="form-input" name="location" value={productForm.location} onChange={e => setProductForm({ ...productForm, location: e.target.value })} placeholder="e.g. Aisle 2, Shelf B" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" name="description" rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Enter detailed specifications..." />
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : selectedProduct ? 'Update Product' : 'Register Product'}
                  </button>
                </div>

              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Stock Adjustment Modal ─────────────────────────────────── */}
      {showAdjustModal && (
        <div className="modal-backdrop" onClick={() => setShowAdjustModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">Inventory Stock Adjustment</h3>
              <button className="icon-btn" onClick={() => setShowAdjustModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAdjustSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                
                <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adjusting Stock For:</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{selectedProduct?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Current Stock: <strong style={{ color: 'var(--accent-primary)' }}>{selectedProduct?.stock} {selectedProduct?.unit}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select className="form-select" value={adjustForm.type} onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                    <option value="Stock In">Stock In (Procurement Add)</option>
                    <option value="Stock Out">Stock Out (Discharge Subtract)</option>
                    <option value="Audit Adjustment">Audit Correction (Override value)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      {adjustForm.type === 'Audit Adjustment' ? 'Audit Override Stock Value' : 'Shift Quantity Amount'} *
                    </label>
                    <input className="form-input" type="number" min="0" value={adjustForm.quantityChanged} onChange={e => setAdjustForm({ ...adjustForm, quantityChanged: e.target.value })} required placeholder="Enter number..." />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference ID (Order / Bill Code)</label>
                  <input className="form-input" value={adjustForm.reference} onChange={e => setAdjustForm({ ...adjustForm, reference: e.target.value })} placeholder="e.g. REC-99212" />
                </div>

                <div className="form-group">
                  <label className="form-label">Audit / Reason Notes</label>
                  <textarea className="form-input" rows={2} value={adjustForm.notes} onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })} placeholder="Describe why this stock adjustment is registered..." />
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Applying...' : 'Apply Stock Shift'}
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

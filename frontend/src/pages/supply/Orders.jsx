import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Truck, CheckCircle, Clock, XCircle, Package, Loader2, 
  ArrowUpRight, ArrowDownLeft, Calendar, FileText, ChevronDown, ChevronUp,
  AlertCircle, Edit, MapPin, Eye, Bell, CheckSquare
} from 'lucide-react';
import { api } from '../../utils/api';

const statusIcon = {
  Draft:             { icon: Clock,        color: 'var(--text-muted)',      badge: 'badge-gray' },
  'Pending Approval': { icon: Clock,        color: 'var(--accent-amber)',    badge: 'badge-warning' },
  Approved:          { icon: CheckCircle,  color: 'var(--accent-purple)',   badge: 'badge-purple' },
  Shipped:           { icon: Truck,        color: 'var(--accent-cyan)',     badge: 'badge-info' },
  Delivered:         { icon: CheckCircle,  color: 'var(--accent-emerald)',  badge: 'badge-success' },
  Completed:         { icon: CheckCircle,  color: 'var(--accent-emerald)',  badge: 'badge-success' },
  Cancelled:         { icon: XCircle,      color: 'var(--accent-rose)',     badge: 'badge-danger' },
};

const shippingStatusColors = {
  Pending: 'var(--text-muted)',
  'In Transit': 'var(--accent-cyan)',
  'Out for Delivery': 'var(--accent-purple)',
  Delivered: 'var(--accent-emerald)',
  Delayed: 'var(--accent-amber)',
  Returned: 'var(--accent-rose)',
};

const workflowStages = ['Draft', 'Pending Approval', 'Approved', 'Shipped', 'Delivered', 'Completed'];

export default function Orders() {
  // Navigation Tabs: 'orders' or 'notifications'
  const [activeTab, setActiveTab] = useState('orders');

  // Datasets
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals / Selection
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null); // ID of expanded row
  const [selectedOrder, setSelectedOrder] = useState(null); // For tracking modal

  // Order creation form
  const [orderForm, setOrderForm] = useState({
    supplierId: '',
    productId: '',
    quantity: 1,
    price: '',
    type: 'Purchase',
    status: 'Pending Approval',
    paymentStatus: 'Unpaid',
    estimatedDelivery: '',
    notes: '',
  });

  // Tracking details form
  const [trackingForm, setTrackingForm] = useState({
    shippingCarrier: '',
    trackingNumber: '',
    shippingStatus: 'Pending',
    estimatedDelivery: '',
    actualDelivery: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ordersRes, contactsRes, productsRes] = await Promise.all([
        api.supply.getOrders(),
        api.supply.getContacts(),
        api.inventory.getProducts({ limit: 100 })
      ]);

      if (ordersRes.success) setOrders(ordersRes.data);
      if (contactsRes.success) setSuppliers(contactsRes.data);
      if (productsRes.success) setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders metadata.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.supply.getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'productId') {
      const prod = products.find(p => p._id === value);
      setOrderForm(prev => ({
        ...prev,
        productId: value,
        price: prod ? prod.price : '',
      }));
    } else {
      setOrderForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const { supplierId, productId, quantity, price, type, status, paymentStatus, estimatedDelivery, notes } = orderForm;
    if (!supplierId || !productId || !quantity || !price) {
      showToast('Please fill in Supplier/Customer, Product, Quantity, and Unit Price.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        contact: supplierId,
        items: [{
          product: productId,
          quantity: Number(quantity),
          price: Number(price),
        }],
        totalAmount: Number(quantity) * Number(price),
        type,
        status,
        paymentStatus,
        notes,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
      };

      const res = await api.supply.createOrder(payload);
      if (res.success) {
        showToast(`Order created successfully.`);
        setShowOrderModal(false);
        setOrderForm({
          supplierId: '',
          productId: '',
          quantity: 1,
          price: '',
          type: 'Purchase',
          status: 'Pending Approval',
          paymentStatus: 'Unpaid',
          estimatedDelivery: '',
          notes: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (orderId, newStatus) => {
    try {
      setSubmitting(true);
      const res = await api.supply.updateOrderStatus(orderId, { status: newStatus });
      if (res.success) {
        showToast(`Order moved to status: ${newStatus}`);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Status transition failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openTrackingModal = (o) => {
    setSelectedOrder(o);
    setTrackingForm({
      shippingCarrier: o.shippingCarrier || '',
      trackingNumber: o.trackingNumber || '',
      shippingStatus: o.shippingStatus || 'Pending',
      estimatedDelivery: o.estimatedDelivery ? o.estimatedDelivery.split('T')[0] : '',
      actualDelivery: o.actualDelivery ? o.actualDelivery.split('T')[0] : '',
    });
    setShowTrackingModal(true);
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.supply.updateOrderStatus(selectedOrder._id, trackingForm);
      if (res.success) {
        showToast('Shipment tracking details saved.');
        setShowTrackingModal(false);
        setSelectedOrder(null);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update tracking details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const res = await api.supply.markNotificationRead(id);
      if (res.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        showToast('Notification cleared.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getWorkflowProgressPercent = (currentStatus) => {
    const idx = workflowStages.indexOf(currentStatus);
    if (idx === -1) return 0;
    return Math.round((idx / (workflowStages.length - 1)) * 100);
  };

  // Filters mapping
  const filteredOrders = orders.filter(o => {
    const matchType = filterType === 'All' ? true : o.type === filterType;
    const matchStatus = filterStatus === 'All' ? true : o.status === filterStatus;
    return matchType && matchStatus;
  });

  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading SCM orders pipeline...</span>
      </div>
    );
  }

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
          <h1 className="page-title">Procurement Workflow & Shipments</h1>
          <p className="page-subtitle">Track multi-stage workflows, logistical tracking numbers, payment logs, and real-time SCM event feeds.</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>
            <Truck size={14} style={{ marginRight: 4 }} /> Orders pipeline
          </button>
          <button className={`btn btn-sm ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('notifications')}>
            <Bell size={14} style={{ marginRight: 4 }} /> SCM Alerts Feed
          </button>
          <button className="btn btn-primary btn-sm" id="orders-add-btn" onClick={() => setShowOrderModal(true)}>
            <Plus size={14} /> Create Order
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* ── TAB 1: Orders Pipeline ────────────────────────────────── */}
      {activeTab === 'orders' && (
        <>
          {/* Quick status summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Pipeline PO/SO', value: orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length, color: 'var(--accent-primary)' },
              { label: 'Pending Approval Stage', value: orders.filter(o => o.status === 'Pending Approval').length, color: 'var(--accent-amber)' },
              { label: 'En Route (Shipped)', value: orders.filter(o => o.status === 'Shipped').length, color: 'var(--accent-cyan)' },
              { label: 'Completed Deliveries', value: orders.filter(o => o.status === 'Completed').length, color: 'var(--accent-emerald)' },
            ].map((st, i) => (
              <motion.div key={i} className="glass-card" style={{ padding: 20 }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{st.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: st.color }}>{st.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Filters Row */}
          <div className="glass-card mb-6" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="flex gap-2">
              {['All', 'Purchase', 'Sales'].map(type => (
                <button key={type} className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterType(type)}>
                  {type === 'All' ? 'All Types' : `${type} Orders`}
                </button>
              ))}
            </div>
            <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
              <select className="form-select" style={{ padding: '6px 12px', fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Workflow States</option>
                {workflowStages.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders table list */}
          {filteredOrders.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '48px 24px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>No orders found matching filters.</span>
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: 'visible' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, overflow: 'visible' }}>
                <table>
                  <thead>
                    <tr>
                      <th></th><th>Order ID</th><th>Contact Company</th><th>Type</th><th>Total Amount</th><th>Order Date</th><th>Workflow Status</th><th>Payment</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => {
                      const statusCfg = statusIcon[o.status] || { badge: 'badge-gray' };
                      const isExpanded = expandedOrder === o._id;
                      return (
                        <>
                          <tr key={o._id} style={{ cursor: 'pointer', borderBottom: isExpanded ? 'none' : '1px solid var(--border)' }} onClick={() => setExpandedOrder(isExpanded ? null : o._id)}>
                            <td>
                              {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--text-white)' }}>{o.orderNumber}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{o.contact?.company || 'Individual'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.contact?.name}</div>
                            </td>
                            <td>
                              <span className="flex items-center gap-1 font-semibold" style={{ fontSize: 12 }}>
                                {o.type === 'Purchase' ? <ArrowDownLeft size={13} color="var(--accent-rose)" /> : <ArrowUpRight size={13} color="var(--accent-emerald)" />}
                                {o.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(o.totalAmount)}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className={`badge ${statusCfg.badge}`}>{o.status}</span>
                            </td>
                            <td>
                              <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-success' : o.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openTrackingModal(o)}>
                                  <Truck size={12} style={{ marginRight: 4 }} /> Tracking
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded detail row containing step-by-step progress tracking */}
                          {isExpanded && (
                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                              <td colSpan="9" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                                  
                                  {/* Step Progress Line */}
                                  <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Procurement Workflow progress</div>
                                    
                                    <div style={{ position: 'relative', height: 6, background: 'var(--border)', borderRadius: 3, marginTop: 12, marginBottom: 12 }}>
                                      <div style={{
                                        position: 'absolute', top: 0, left: 0, height: '100%',
                                        width: `${getWorkflowProgressPercent(o.status)}%`,
                                        background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-emerald))',
                                        borderRadius: 3, transition: 'width 0.4s ease'
                                      }} />
                                      
                                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', top: -8 }}>
                                        {workflowStages.map((stage, sIdx) => {
                                          const isDone = workflowStages.indexOf(o.status) >= sIdx;
                                          const isActive = o.status === stage;
                                          return (
                                            <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                              <div style={{
                                                width: 22, height: 22, borderRadius: '50%',
                                                background: isActive ? 'var(--accent-primary)' : isDone ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                                                border: `2px solid ${isActive ? 'white' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900
                                              }}>
                                                {isDone ? '✓' : sIdx + 1}
                                              </div>
                                              <span style={{ fontSize: 10, color: isActive ? 'var(--text-white)' : 'var(--text-muted)', marginTop: 4, fontWeight: isActive ? 700 : 500 }}>
                                                {stage}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sub details: Items lists, shipment tracking logs */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: 32 }}>
                                    
                                    {/* Items list */}
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Ordered Items list</div>
                                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12 }}>
                                        {o.items?.map((item, idx) => (
                                          <div key={idx} className="flex justify-between items-center" style={{ fontSize: 13, paddingBottom: 6, borderBottom: idx < o.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', marginTop: idx > 0 ? 6 : 0 }}>
                                            <div>
                                              <div style={{ fontWeight: 600 }}>{item.product?.name || 'Product'}</div>
                                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SKU: {item.product?.sku || 'N/A'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                              <div style={{ fontWeight: 700 }}>{item.quantity} {item.product?.unit || 'pcs'}</div>
                                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(item.price)} each</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Shipping details */}
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Logistical Tracking Info</div>
                                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                        {o.trackingNumber ? (
                                          <div style={{ display: 'grid', gap: 6 }}>
                                            <div>Carrier: <strong>{o.shippingCarrier}</strong></div>
                                            <div>Tracking: <strong style={{ fontFamily: 'monospace' }}>{o.trackingNumber}</strong></div>
                                            <div>Shipment Status: <strong style={{ color: shippingStatusColors[o.shippingStatus] }}>{o.shippingStatus}</strong></div>
                                            {o.estimatedDelivery && <div>Est. Delivery: <strong>{new Date(o.estimatedDelivery).toLocaleDateString('en-IN')}</strong></div>}
                                          </div>
                                        ) : (
                                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', height: '100%', minHeight: 60 }}>
                                            No shipment details mapped yet. Click "Tracking" above to set.
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action workflow triggers */}
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Transition order status</div>
                                      <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
                                        {o.status === 'Draft' && (
                                          <button className="btn btn-secondary btn-sm" disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Pending Approval')}>Submit for Approval</button>
                                        )}
                                        {o.status === 'Pending Approval' && (
                                          <button className="btn btn-primary btn-sm" disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Approved')}>Approve Order</button>
                                        )}
                                        {o.status === 'Approved' && (
                                          <button className="btn btn-primary btn-sm" disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Shipped')}>Mark as Shipped</button>
                                        )}
                                        {o.status === 'Shipped' && (
                                          <button className="btn btn-primary btn-sm" disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Delivered')}>Receive Goods (Deliver)</button>
                                        )}
                                        {o.status === 'Delivered' && (
                                          <button className="btn btn-emerald btn-sm" disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Completed')}>Mark Completed</button>
                                        )}
                                        {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                                          <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)' }} disabled={submitting} onClick={() => handleStatusTransition(o._id, 'Cancelled')}>Cancel Order</button>
                                        )}
                                        {['Completed', 'Cancelled'].includes(o.status) && (
                                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Fulfillment lifecycle closed.</span>
                                        )}
                                      </div>
                                      {o.notes && (
                                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                          Memo: "{o.notes}"
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: Notifications Alert Feed ────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 className="section-title"><Bell size={18} style={{ display: 'inline', marginRight: 6 }} /> Supply Chain Activity Logs</h3>
          
          {notifLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 size={24} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>No activity notifications recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map(n => (
                <div key={n._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: n.read ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.05)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(99,102,241,0.2)'}`,
                  borderRadius: 10, padding: 14
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: n.read ? 'var(--text-secondary)' : 'var(--text-white)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                  {!n.read && (
                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => markNotificationAsRead(n._id)}>
                      Clear Alert
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create Order Modal ────────────────────────────────────── */}
      {showOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">Log Procurement / Sales Order</h3>
              <button className="icon-btn" onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleOrderSubmit}>
              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Order Type *</label>
                    <select className="form-select" name="type" value={orderForm.type} onChange={handleOrderFormChange}>
                      <option value="Purchase">Purchase (Inward Procurement)</option>
                      <option value="Sales">Sales (Outward Fulfillment)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client / Supplier Contact *</label>
                    <select className="form-select" name="supplierId" value={orderForm.supplierId} onChange={handleOrderFormChange} required>
                      <option value="">-- Select Contact --</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.company || s.name} ({s.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Select Product *</label>
                    <select className="form-select" name="productId" value={orderForm.productId} onChange={handleOrderFormChange} required>
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock} {p.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity Amount *</label>
                    <input className="form-input" type="number" min="1" name="quantity" value={orderForm.quantity} onChange={handleOrderFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Unit (₹) *</label>
                    <input className="form-input" type="number" min="0" name="price" value={orderForm.price} onChange={handleOrderFormChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Starting Status</label>
                    <select className="form-select" name="status" value={orderForm.status} onChange={handleOrderFormChange}>
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Direct Completed (Sync Stock)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" name="paymentStatus" value={orderForm.paymentStatus} onChange={handleOrderFormChange}>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Est. Delivery Date</label>
                    <input className="form-input" type="date" name="estimatedDelivery" value={orderForm.estimatedDelivery} onChange={handleOrderFormChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Reference / Notes</label>
                  <textarea className="form-input" name="notes" rows={2} value={orderForm.notes} onChange={handleOrderFormChange} placeholder="Enter specifications..." />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                  Estimated Order Total: <strong style={{ color: 'var(--accent-primary)', fontSize: 15 }}>{fmt(Number(orderForm.quantity || 0) * Number(orderForm.price || 0))}</strong>
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Creating...' : 'Log Order'}
                  </button>
                </div>

              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Shipment Tracking Modal ───────────────────────────────── */}
      {showTrackingModal && (
        <div className="modal-backdrop" onClick={() => setShowTrackingModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">Shipment Tracking: {selectedOrder?.orderNumber}</h3>
              <button className="icon-btn" onClick={() => setShowTrackingModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleTrackingSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                
                <div className="form-group">
                  <label className="form-label">Logistics Shipping Carrier</label>
                  <input className="form-input" value={trackingForm.shippingCarrier} onChange={e => setTrackingForm({ ...trackingForm, shippingCarrier: e.target.value })} placeholder="e.g. FedEx, BlueDart, DHL" />
                </div>

                <div className="form-group">
                  <label className="form-label">Awb Tracking Number</label>
                  <input className="form-input" value={trackingForm.trackingNumber} onChange={e => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })} placeholder="TRACKXXXXXXXX" />
                </div>

                <div className="form-group">
                  <label className="form-label">Transit Tracking Status</label>
                  <select className="form-select" value={trackingForm.shippingStatus} onChange={e => setTrackingForm({ ...trackingForm, shippingStatus: e.target.value })}>
                    <option value="Pending">Pending Dispatch</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Estimated Delivery</label>
                    <input className="form-input" type="date" value={trackingForm.estimatedDelivery} onChange={e => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Actual Delivery Date</label>
                    <input className="form-input" type="date" value={trackingForm.actualDelivery} onChange={e => setTrackingForm({ ...trackingForm, actualDelivery: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTrackingModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    Apply Tracking Status
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

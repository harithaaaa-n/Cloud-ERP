// Seed data for CloudERP Demo Mode
const SEED_USERS = [
  { id: 'u1', name: 'Neelima Admin', email: 'admin@clouderp.com', role: 'admin', isActive: true },
  { id: 'u2', name: 'Priya Sharma', email: 'hr@clouderp.com', role: 'hr', isActive: true },
  { id: 'u3', name: 'Vikram Manager', email: 'manager@clouderp.com', role: 'manager', isActive: true },
  { id: 'u4', name: 'Arjun Mehta', email: 'employee@clouderp.com', role: 'employee', isActive: true },
  { id: 'u5', name: 'Rohan Finance', email: 'finance@clouderp.com', role: 'finance', isActive: true },
  { id: 'u6', name: 'Kunal Inventory', email: 'inventory@clouderp.com', role: 'inventory', isActive: true },
  { id: 'u7', name: 'Siddharth Supply', email: 'supply@clouderp.com', role: 'supply', isActive: true }
];

const SEED_EMPLOYEES = [
  {
    _id: 'emp-101',
    name: 'Arjun Mehta',
    email: 'employee@clouderp.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    salary: 125000,
    isActive: true,
    attendance: [
      { _id: 'att-1', date: '2026-06-01', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present' },
      { _id: 'att-2', date: '2026-06-02', checkIn: '09:12 AM', checkOut: '06:05 PM', status: 'Present' }
    ],
    leaves: [
      { _id: 'lv-1', type: 'Sick', startDate: '2026-05-10', endDate: '2026-05-11', reason: 'Flu symptoms', status: 'Approved' }
    ],
    salaries: [
      { _id: 'sal-1', month: 'May 2026', basicSalary: 125000, allowances: 8000, deductions: 5000, netSalary: 128000, status: 'Paid', processedAt: '2026-05-30T10:00:00Z' }
    ]
  },
  {
    _id: 'emp-102',
    name: 'Priya Sharma',
    email: 'hr@clouderp.com',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Operations Lead',
    salary: 95000,
    isActive: true,
    attendance: [
      { _id: 'att-3', date: '2026-06-01', checkIn: '08:58 AM', checkOut: '05:30 PM', status: 'Present' },
      { _id: 'att-4', date: '2026-06-02', checkIn: '09:00 AM', checkOut: '05:45 PM', status: 'Present' }
    ],
    leaves: [],
    salaries: [
      { _id: 'sal-2', month: 'May 2026', basicSalary: 95000, allowances: 5000, deductions: 3500, netSalary: 96500, status: 'Paid', processedAt: '2026-05-30T10:15:00Z' }
    ]
  },
  {
    _id: 'emp-103',
    name: 'Vikram Manager',
    email: 'manager@clouderp.com',
    role: 'manager',
    department: 'Operations',
    position: 'General Operations Manager',
    salary: 140000,
    isActive: true,
    attendance: [
      { _id: 'att-5', date: '2026-06-01', checkIn: '09:02 AM', checkOut: '06:30 PM', status: 'Present' },
      { _id: 'att-6', date: '2026-06-02', checkIn: '08:45 AM', checkOut: '06:00 PM', status: 'Present' }
    ],
    leaves: [],
    salaries: [
      { _id: 'sal-3', month: 'May 2026', basicSalary: 140000, allowances: 12000, deductions: 6000, netSalary: 146000, status: 'Paid', processedAt: '2026-05-30T10:20:00Z' }
    ]
  },
  {
    _id: 'emp-104',
    name: 'Rohan Finance',
    email: 'finance@clouderp.com',
    role: 'finance',
    department: 'Finance',
    position: 'Chief Treasury Auditor',
    salary: 110000,
    isActive: true,
    attendance: [
      { _id: 'att-7', date: '2026-06-01', checkIn: '09:10 AM', checkOut: '05:30 PM', status: 'Present' }
    ],
    leaves: [],
    salaries: []
  }
];

const SEED_PRODUCTS = [
  { _id: 'p-1', sku: 'SKU-EM-01', name: 'Silicon Transistors BJT', description: 'High-frequency switching transistors for processor cores.', category: 'Electronics', quantity: 2450, unit: 'units', unitPrice: 45, minStock: 500, warehouse: 'Warehouse Alpha', status: 'In Stock' },
  { _id: 'p-2', sku: 'SKU-EM-02', name: 'Alumina Substrates 4x4', description: 'Thermal dissipation layers for industrial circuit layout.', category: 'Ceramics', quantity: 380, unit: 'units', unitPrice: 220, minStock: 400, warehouse: 'Warehouse Alpha', status: 'Low Stock' },
  { _id: 'p-3', sku: 'SKU-EM-03', name: 'Copper Wiring Reels 22AWG', description: 'Flexible copper interconnect spools for power supply links.', category: 'Wiring', quantity: 18, unit: 'reels', unitPrice: 1250, minStock: 25, warehouse: 'Warehouse Beta', status: 'Low Stock' },
  { _id: 'p-4', sku: 'SKU-EM-04', name: 'LED Matrix Displays 8x8', description: 'Vibrant RGB visual warning arrays for panel assemblies.', category: 'Displays', quantity: 1250, unit: 'units', unitPrice: 85, minStock: 200, warehouse: 'Warehouse Beta', status: 'In Stock' }
];

const SEED_CONTACTS = [
  { _id: 'c-1', name: 'Apex Microelectronics', contactPerson: 'Hitesh Patel', email: 'sales@apexmicro.com', phone: '+91 98765 43210', category: 'Supplier', rating: 4.8 },
  { _id: 'c-2', name: 'Stellar Semiconductors', contactPerson: 'Sunita Rao', email: 'orders@stellarsemi.com', phone: '+91 87654 32109', category: 'Supplier', rating: 4.5 },
  { _id: 'c-3', name: 'Zenith Logistics Hub', contactPerson: 'Devendra Gill', email: 'dispatch@zenithlog.com', phone: '+91 76543 21098', category: 'Logistics Partner', rating: 4.2 }
];

const SEED_ORDERS = [
  { _id: 'ord-1001', orderNumber: 'PO-2026-1001', vendor: 'Apex Microelectronics', items: [{ name: 'Silicon Transistors BJT', quantity: 1000, price: 40 }], totalCost: 40000, status: 'Delivered', expectedDelivery: '2026-05-25', notes: 'Urgent procurement of batch 2.' },
  { _id: 'ord-1002', orderNumber: 'PO-2026-1002', vendor: 'Stellar Semiconductors', items: [{ name: 'Alumina Substrates 4x4', quantity: 200, price: 210 }], totalCost: 42000, status: 'Shipped', expectedDelivery: '2026-06-08', notes: 'Scheduled restock to lift warning.' },
  { _id: 'ord-1003', orderNumber: 'PO-2026-1003', vendor: 'Zenith Logistics Hub', items: [{ name: 'Copper Wiring Reels 22AWG', quantity: 10, price: 1200 }], totalCost: 12000, status: 'Pending', expectedDelivery: '2026-06-12', notes: 'Requires inspection upon arrival.' }
];

const SEED_TRANSACTIONS = [
  { _id: 'tx-1', reference: 'TXN-902341', type: 'revenue', category: 'Sales', description: 'Enterprise Licensing - Q2 Vertex Commerce', amount: 840000, date: '2026-06-01', user: 'u5' },
  { _id: 'tx-2', reference: 'TXN-902342', type: 'expense', category: 'Payroll', description: 'Staff Salaries Dispersal - May 2026', amount: 370500, date: '2026-05-30', user: 'u5' },
  { _id: 'tx-3', reference: 'TXN-902343', type: 'expense', category: 'Supplies', description: 'Apex Microelectronics PO-2026-1001', amount: 40000, date: '2026-05-25', user: 'u5' },
  { _id: 'tx-4', reference: 'TXN-902344', type: 'revenue', category: 'Operating', description: 'System Integration Consulting Services', amount: 150000, date: '2026-05-20', user: 'u5' }
];

const SEED_NOTIFICATIONS = [
  { _id: 'n-1', title: 'Low Stock Alert', message: 'Copper Wiring Reels (SKU-EM-03) has fallen below safety minimum level.', type: 'alert', read: false, createdAt: '2026-06-02T10:00:00Z' },
  { _id: 'n-2', title: 'Leave Applied', message: 'Arjun Mehta has submitted a Sick leave request for review.', type: 'info', read: false, createdAt: '2026-06-02T08:30:00Z' },
  { _id: 'n-3', title: 'Ledger Audit Complete', message: 'Finance reconciliation checks successfully closed for Q2.', type: 'success', read: true, createdAt: '2026-05-31T17:00:00Z' }
];

const SEED_INSIGHTS = [
  { _id: 'i-1', title: 'Procurement Strategy Optimization', summary: 'Consolidate chip purchases under Stellar Semiconductors to earn an additional 4% volume rebate.', severity: 'medium', impact: 'Save approx. ₹1.2L annually' },
  { _id: 'i-2', title: 'Liquidity Surplus Forecast', summary: 'Strong invoicing receipts in June indicate a surplus reserve of ₹12.5M. Consider early vendor settlements to yield discounts.', severity: 'high', impact: 'Cash optimization opportunity' },
  { _id: 'i-3', title: 'Reorder Window Warning', summary: 'Based on average assembly depletion rates, order placing for SKU-EM-02 must clear by Friday to avert production stoppage.', severity: 'critical', impact: 'Prevent assembly delays' }
];

// Helper to load or initialize database in LocalStorage
const getStorageItem = (key, fallback) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch {
    return fallback;
  }
};

const setStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const initializeDemoDB = () => {
  getStorageItem('clouderp_demo_employees', SEED_EMPLOYEES);
  getStorageItem('clouderp_demo_products', SEED_PRODUCTS);
  getStorageItem('clouderp_demo_contacts', SEED_CONTACTS);
  getStorageItem('clouderp_demo_orders', SEED_ORDERS);
  getStorageItem('clouderp_demo_transactions', SEED_TRANSACTIONS);
  getStorageItem('clouderp_demo_notifications', SEED_NOTIFICATIONS);
  getStorageItem('clouderp_demo_insights', SEED_INSIGHTS);
};

// CRUD Methods for Demo Mode
export const demoDB = {
  // Authentication Mock
  login: (email, password) => {
    const user = SEED_USERS.find(u => u.email === email);
    if (!user) throw new Error('Invalid email credentials.');
    if (password !== 'CloudERP@123') throw new Error('Incorrect password entered.');
    return {
      success: true,
      accessToken: 'demo-jwt-token-rotating-mock',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true
      }
    };
  },

  // Employees Module
  getEmployees: () => getStorageItem('clouderp_demo_employees', SEED_EMPLOYEES),
  saveEmployees: (data) => setStorageItem('clouderp_demo_employees', data),
  createEmployee: (emp) => {
    const list = demoDB.getEmployees();
    const newEmp = {
      _id: `emp-${Date.now()}`,
      name: emp.name,
      email: emp.email,
      role: emp.role || 'employee',
      department: emp.department || 'General',
      position: emp.position || 'Staff',
      salary: emp.salary ? Number(emp.salary) : 50000,
      isActive: true,
      attendance: [],
      leaves: [],
      salaries: []
    };
    list.push(newEmp);
    demoDB.saveEmployees(list);
    return newEmp;
  },
  updateEmployee: (id, update) => {
    const list = demoDB.getEmployees();
    const idx = list.findIndex(e => e._id === id);
    if (idx === -1) throw new Error('Employee not found');
    list[idx] = { ...list[idx], ...update };
    demoDB.saveEmployees(list);
    return list[idx];
  },
  deleteEmployee: (id) => {
    const list = demoDB.getEmployees();
    const filtered = list.filter(e => e._id !== id);
    demoDB.saveEmployees(filtered);
    return { success: true };
  },

  // Attendance & Leaves logs
  recordAttendance: (id, checkIn, checkOut) => {
    const list = demoDB.getEmployees();
    const emp = list.find(e => e._id === id);
    if (!emp) throw new Error('Employee not found');
    
    if (!emp.attendance) emp.attendance = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance already recorded today
    const exists = emp.attendance.find(a => a.date === today);
    if (exists) {
      exists.checkOut = checkOut || '05:30 PM';
    } else {
      emp.attendance.push({
        _id: `att-${Date.now()}`,
        date: today,
        checkIn: checkIn || '09:00 AM',
        checkOut: checkOut || '05:30 PM',
        status: 'Present'
      });
    }
    demoDB.saveEmployees(list);
    return emp;
  },
  applyLeave: (id, type, startDate, endDate, reason) => {
    const list = demoDB.getEmployees();
    const emp = list.find(e => e._id === id);
    if (!emp) throw new Error('Employee not found');
    if (!emp.leaves) emp.leaves = [];
    const newLeave = {
      _id: `lv-${Date.now()}`,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    };
    emp.leaves.push(newLeave);
    demoDB.saveEmployees(list);

    // Notify
    const notifs = demoDB.getNotifications();
    notifs.push({
      _id: `n-${Date.now()}`,
      title: 'New Leave Request',
      message: `${emp.name} applied for ${type} leave.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });
    demoDB.saveNotifications(notifs);

    return newLeave;
  },
  updateLeaveStatus: (leaveId, status) => {
    const list = demoDB.getEmployees();
    let found = false;
    for (const emp of list) {
      const lv = emp.leaves?.find(l => l._id === leaveId);
      if (lv) {
        lv.status = status;
        found = true;
        break;
      }
    }
    if (!found) throw new Error('Leave record not found');
    demoDB.saveEmployees(list);
    return { success: true };
  },

  // Payroll
  generateSalary: (id, month, basicSalary, allowances, deductions) => {
    const list = demoDB.getEmployees();
    const emp = list.find(e => e._id === id);
    if (!emp) throw new Error('Employee not found');
    if (!emp.salaries) emp.salaries = [];
    const net = Number(basicSalary) + Number(allowances) - Number(deductions);
    const slip = {
      _id: `sal-${Date.now()}`,
      month,
      basicSalary: Number(basicSalary),
      allowances: Number(allowances),
      deductions: Number(deductions),
      netSalary: net,
      status: 'Generated',
      processedAt: new Date().toISOString()
    };
    emp.salaries.push(slip);
    demoDB.saveEmployees(list);
    return slip;
  },
  paySalary: (salaryId) => {
    const list = demoDB.getEmployees();
    let found = false;
    let paidSlip = null;
    let employeeName = '';
    for (const emp of list) {
      const sl = emp.salaries?.find(s => s._id === salaryId);
      if (sl) {
        sl.status = 'Paid';
        sl.processedAt = new Date().toISOString();
        paidSlip = sl;
        employeeName = emp.name;
        found = true;
        break;
      }
    }
    if (!found) throw new Error('Salary record not found');
    demoDB.saveEmployees(list);

    // Create a transaction record too!
    const txns = demoDB.getTransactions();
    txns.push({
      _id: `tx-${Date.now()}`,
      reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'expense',
      category: 'Payroll',
      description: `Staff Payout - ${employeeName} (${paidSlip.month})`,
      amount: paidSlip.netSalary,
      date: new Date().toISOString().split('T')[0],
      user: 'demo-finance'
    });
    demoDB.saveTransactions(txns);

    return { success: true };
  },
  getAllPayslips: () => {
    const list = demoDB.getEmployees();
    const all = [];
    for (const emp of list) {
      emp.salaries?.forEach(s => {
        all.push({
          ...s,
          employeeId: emp._id,
          employeeName: emp.name,
          department: emp.department
        });
      });
    }
    return all;
  },

  // Inventory Module
  getProducts: () => getStorageItem('clouderp_demo_products', SEED_PRODUCTS),
  saveProducts: (data) => setStorageItem('clouderp_demo_products', data),
  createProduct: (prod) => {
    const list = demoDB.getProducts();
    const newProd = {
      _id: `p-${Date.now()}`,
      sku: prod.sku || `SKU-EM-${Math.floor(10 + Math.random() * 90)}`,
      name: prod.name,
      description: prod.description || '',
      category: prod.category || 'General',
      quantity: Number(prod.quantity) || 0,
      unit: prod.unit || 'units',
      unitPrice: Number(prod.unitPrice) || 0,
      minStock: Number(prod.minStock) || 0,
      warehouse: prod.warehouse || 'Warehouse Alpha',
      status: (Number(prod.quantity) <= Number(prod.minStock)) ? 'Low Stock' : 'In Stock'
    };
    list.push(newProd);
    demoDB.saveProducts(list);
    return newProd;
  },
  updateProduct: (id, update) => {
    const list = demoDB.getProducts();
    const idx = list.findIndex(p => p._id === id);
    if (idx === -1) throw new Error('Product not found');
    list[idx] = { ...list[idx], ...update };
    list[idx].status = (Number(list[idx].quantity) <= Number(list[idx].minStock)) ? 'Low Stock' : 'In Stock';
    demoDB.saveProducts(list);
    return list[idx];
  },
  deleteProduct: (id) => {
    const list = demoDB.getProducts();
    const filtered = list.filter(p => p._id !== id);
    demoDB.saveProducts(filtered);
    return { success: true };
  },
  adjustStock: (id, qty, reason) => {
    const list = demoDB.getProducts();
    const prod = list.find(p => p._id === id);
    if (!prod) throw new Error('Product not found');
    prod.quantity = Math.max(0, prod.quantity + Number(qty));
    prod.status = (Number(prod.quantity) <= Number(prod.minStock)) ? 'Low Stock' : 'In Stock';
    demoDB.saveProducts(list);

    // Save adjustment logs
    const logs = getStorageItem('clouderp_demo_inventory_logs', []);
    logs.push({
      _id: `log-${Date.now()}`,
      productName: prod.name,
      sku: prod.sku,
      adjustment: Number(qty),
      reason: reason || 'Manual Correction',
      date: new Date().toISOString()
    });
    setStorageItem('clouderp_demo_inventory_logs', logs);

    return prod;
  },
  getInventoryLogs: () => getStorageItem('clouderp_demo_inventory_logs', []),

  // Supply Chain Module
  getContacts: () => getStorageItem('clouderp_demo_contacts', SEED_CONTACTS),
  saveContacts: (data) => setStorageItem('clouderp_demo_contacts', data),
  createContact: (cnt) => {
    const list = demoDB.getContacts();
    const newCnt = {
      _id: `c-${Date.now()}`,
      name: cnt.name,
      contactPerson: cnt.contactPerson || '',
      email: cnt.email || '',
      phone: cnt.phone || '',
      category: cnt.category || 'Supplier',
      rating: 5.0
    };
    list.push(newCnt);
    demoDB.saveContacts(list);
    return newCnt;
  },
  updateContact: (id, update) => {
    const list = demoDB.getContacts();
    const idx = list.findIndex(c => c._id === id);
    if (idx === -1) throw new Error('Contact not found');
    list[idx] = { ...list[idx], ...update };
    demoDB.saveContacts(list);
    return list[idx];
  },
  deleteContact: (id) => {
    const list = demoDB.getContacts();
    const filtered = list.filter(c => c._id !== id);
    demoDB.saveContacts(filtered);
    return { success: true };
  },

  getOrders: () => getStorageItem('clouderp_demo_orders', SEED_ORDERS),
  saveOrders: (data) => setStorageItem('clouderp_demo_orders', data),
  createOrder: (ord) => {
    const list = demoDB.getOrders();
    const newOrd = {
      _id: `ord-${Date.now()}`,
      orderNumber: `PO-2026-${Math.floor(1004 + Math.random() * 900)}`,
      vendor: ord.vendor,
      items: ord.items || [{ name: 'Raw components', quantity: 10, price: 100 }],
      totalCost: Number(ord.totalCost) || 1000,
      status: 'Pending',
      expectedDelivery: ord.expectedDelivery || new Date().toISOString().split('T')[0],
      notes: ord.notes || ''
    };
    list.push(newOrd);
    demoDB.saveOrders(list);
    return newOrd;
  },
  updateOrderStatus: (id, status) => {
    const list = demoDB.getOrders();
    const ord = list.find(o => o._id === id);
    if (!ord) throw new Error('Order not found');
    ord.status = status;
    demoDB.saveOrders(list);

    // If order is delivered, automatically restock the inventory item
    if (status === 'Delivered') {
      ord.items?.forEach(item => {
        const prods = demoDB.getProducts();
        const pr = prods.find(p => p.name === item.name);
        if (pr) {
          demoDB.adjustStock(pr._id, item.quantity, `Reconciliation from delivered PO: ${ord.orderNumber}`);
        }
      });
    }

    return ord;
  },

  // Finance Module
  getTransactions: () => getStorageItem('clouderp_demo_transactions', SEED_TRANSACTIONS),
  saveTransactions: (data) => setStorageItem('clouderp_demo_transactions', data),
  createTransaction: (tx) => {
    const list = demoDB.getTransactions();
    const newTx = {
      _id: `tx-${Date.now()}`,
      reference: tx.reference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: tx.type || 'expense',
      category: tx.category || 'Operating',
      description: tx.description || '',
      amount: Number(tx.amount) || 0,
      date: tx.date || new Date().toISOString().split('T')[0],
      user: 'demo-user'
    };
    list.push(newTx);
    demoDB.saveTransactions(list);
    return newTx;
  },

  // Notifications Module
  getNotifications: () => getStorageItem('clouderp_demo_notifications', SEED_NOTIFICATIONS),
  saveNotifications: (data) => setStorageItem('clouderp_demo_notifications', data),
  markNotificationRead: (id) => {
    const list = demoDB.getNotifications();
    const item = list.find(n => n._id === id);
    if (item) item.read = true;
    demoDB.saveNotifications(list);
    return { success: true };
  },
  markAllNotificationsRead: () => {
    const list = demoDB.getNotifications();
    list.forEach(n => n.read = true);
    demoDB.saveNotifications(list);
    return { success: true };
  },
  deleteNotification: (id) => {
    const list = demoDB.getNotifications();
    const filtered = list.filter(n => n._id !== id);
    demoDB.saveNotifications(filtered);
    return { success: true };
  },

  // Insights
  getInsights: () => getStorageItem('clouderp_demo_insights', SEED_INSIGHTS),

  // Analytics Helpers
  getAdvancedData: () => {
    const txns = demoDB.getTransactions();
    const emps = demoDB.getEmployees();
    const prods = demoDB.getProducts();

    // Sum revenue and expenses
    let totalRevenue = 0;
    let totalExpense = 0;
    txns.forEach(t => {
      if (t.type === 'revenue') totalRevenue += t.amount;
      else totalExpense += t.amount;
    });

    const activeEmployeesCount = emps.filter(e => e.isActive).length;
    const inventoryVal = prods.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const lowStockCount = prods.filter(p => p.quantity <= p.minStock).length;

    // Monthly breakdown data for charts
    const monthlyFinance = [
      { month: 'Jan', revenue: 650000, expenses: 320000 },
      { month: 'Feb', revenue: 780000, expenses: 350000 },
      { month: 'Mar', revenue: 720000, expenses: 400000 },
      { month: 'Apr', revenue: 890000, expenses: 380000 },
      { month: 'May', revenue: 950000, expenses: 420000 },
      { month: 'Jun', revenue: totalRevenue || 1200000, expenses: totalExpense || 450000 }
    ];

    const departmentSalaryDistribution = [
      { name: 'Engineering', value: emps.filter(e => e.department === 'Engineering').reduce((sum, e) => sum + e.salary, 0) || 125000 },
      { name: 'HR', value: emps.filter(e => e.department === 'Human Resources').reduce((sum, e) => sum + e.salary, 0) || 95000 },
      { name: 'Operations', value: emps.filter(e => e.department === 'Operations').reduce((sum, e) => sum + e.salary, 0) || 140000 },
      { name: 'Finance', value: emps.filter(e => e.department === 'Finance').reduce((sum, e) => sum + e.salary, 0) || 110000 }
    ];

    return {
      overview: {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense,
        profitMargin: totalRevenue ? Math.round(((totalRevenue - totalExpense) / totalRevenue) * 100) : 0,
        employeeCount: activeEmployeesCount,
        inventoryValue: inventoryVal,
        lowStockItems: lowStockCount
      },
      charts: {
        monthlyFinance,
        departmentSalaries: departmentSalaryDistribution
      }
    };
  }
};

// Mock data for the entire ERP system

export const mockStats = {
  totalRevenue: 4_850_320,
  revenueGrowth: 12.4,
  totalExpenses: 2_340_100,
  expenseGrowth: 3.2,
  netProfit: 2_510_220,
  profitGrowth: 22.1,
  activeEmployees: 248,
  newHires: 12,
  pendingOrders: 34,
  deliveredOrders: 189,
  inventoryItems: 1_240,
  lowStockItems: 18,
};

export const mockRevenueData = [
  { month: 'Oct', revenue: 3200000, expenses: 1800000 },
  { month: 'Nov', revenue: 3600000, expenses: 2000000 },
  { month: 'Dec', revenue: 4100000, expenses: 2200000 },
  { month: 'Jan', revenue: 3900000, expenses: 2100000 },
  { month: 'Feb', revenue: 4300000, expenses: 2250000 },
  { month: 'Mar', revenue: 4850320, expenses: 2340100 },
];

export const mockTransactions = [
  { id: 'TXN-001', type: 'Income',  category: 'Sales',       amount: 245000, date: '2026-04-10', status: 'Completed', ref: 'INV-2024' },
  { id: 'TXN-002', type: 'Expense', category: 'Salaries',    amount: 180000, date: '2026-04-09', status: 'Completed', ref: 'PAY-0411' },
  { id: 'TXN-003', type: 'Income',  category: 'Services',    amount: 85000,  date: '2026-04-08', status: 'Pending',   ref: 'SVC-088'  },
  { id: 'TXN-004', type: 'Expense', category: 'Procurement', amount: 62000,  date: '2026-04-07', status: 'Completed', ref: 'PO-1122' },
  { id: 'TXN-005', type: 'Income',  category: 'Consulting',  amount: 120000, date: '2026-04-06', status: 'Completed', ref: 'CSL-055' },
  { id: 'TXN-006', type: 'Expense', category: 'Utilities',   amount: 18500,  date: '2026-04-05', status: 'Completed', ref: 'UTL-2026' },
  { id: 'TXN-007', type: 'Expense', category: 'Marketing',   amount: 35000,  date: '2026-04-03', status: 'Pending',   ref: 'MKT-077' },
  { id: 'TXN-008', type: 'Income',  category: 'Sales',       amount: 310000, date: '2026-04-02', status: 'Completed', ref: 'INV-2025' },
];

export const mockEmployees = [
  { id: 'EMP-001', name: 'Arjun Mehta',    role: 'Engineering Lead',    dept: 'Technology',  salary: 95000,  status: 'Active',    avatar: 'AM', joined: '2022-01-15' },
  { id: 'EMP-002', name: 'Priya Sharma',   role: 'HR Manager',          dept: 'Human Resources', salary: 72000, status: 'Active', avatar: 'PS', joined: '2021-06-20' },
  { id: 'EMP-003', name: 'Rahul Singh',    role: 'Finance Analyst',     dept: 'Finance',     salary: 68000,  status: 'Active',    avatar: 'RS', joined: '2023-03-10' },
  { id: 'EMP-004', name: 'Anika Gupta',    role: 'Product Designer',    dept: 'Design',      salary: 78000,  status: 'Active',    avatar: 'AG', joined: '2022-09-05' },
  { id: 'EMP-005', name: 'Dev Kapoor',     role: 'Supply Chain Mgr',    dept: 'Operations',  salary: 82000,  status: 'Active',    avatar: 'DK', joined: '2020-11-30' },
  { id: 'EMP-006', name: 'Meera Nair',     role: 'Data Scientist',       dept: 'Technology',  salary: 91000, status: 'Active',    avatar: 'MN', joined: '2023-01-22' },
  { id: 'EMP-007', name: 'Vikram Patel',   role: 'Sales Director',       dept: 'Sales',       salary: 105000, status: 'Active',   avatar: 'VP', joined: '2019-07-14' },
  { id: 'EMP-008', name: 'Sneha Reddy',    role: 'Backend Developer',    dept: 'Technology',  salary: 84000,  status: 'Inactive',  avatar: 'SR', joined: '2023-05-01' },
];

export const mockPayroll = [
  { id: 'PAY-001', employee: 'Arjun Mehta',  month: '2026-03', basic: 95000,  allowances: 12000, deductions: 9500,  net: 97500,  status: 'Paid' },
  { id: 'PAY-002', employee: 'Priya Sharma', month: '2026-03', basic: 72000,  allowances: 8000,  deductions: 7200,  net: 72800,  status: 'Paid' },
  { id: 'PAY-003', employee: 'Rahul Singh',  month: '2026-03', basic: 68000,  allowances: 6000,  deductions: 6800,  net: 67200,  status: 'Paid' },
  { id: 'PAY-004', employee: 'Anika Gupta',  month: '2026-03', basic: 78000,  allowances: 9000,  deductions: 7800,  net: 79200,  status: 'Pending' },
  { id: 'PAY-005', employee: 'Dev Kapoor',   month: '2026-03', basic: 82000,  allowances: 10000, deductions: 8200,  net: 83800,  status: 'Paid' },
  { id: 'PAY-006', employee: 'Meera Nair',   month: '2026-03', basic: 91000,  allowances: 11000, deductions: 9100,  net: 92900,  status: 'Processing' },
];

export const mockProducts = [
  { id: 'PRD-001', name: 'Intel Core i9 Processor', sku: 'CPU-I9-001', category: 'Electronics', qty: 45,  price: 580,  reorderLevel: 10, status: 'Good'     },
  { id: 'PRD-002', name: 'Samsung 32GB DDR5 RAM',   sku: 'RAM-32-005', category: 'Electronics', qty: 8,   price: 180,  reorderLevel: 15, status: 'Low'      },
  { id: 'PRD-003', name: 'WD 2TB NVMe SSD',         sku: 'SSD-2T-009', category: 'Storage',     qty: 120, price: 220,  reorderLevel: 20, status: 'Good'     },
  { id: 'PRD-004', name: 'ASUS RTX 4080 GPU',        sku: 'GPU-4080-02', category: 'Electronics', qty: 5,  price: 1200, reorderLevel: 8,  status: 'Critical' },
  { id: 'PRD-005', name: 'Dell 27" 4K Monitor',      sku: 'MON-27-003', category: 'Display',     qty: 34,  price: 650,  reorderLevel: 10, status: 'Good'     },
  { id: 'PRD-006', name: 'Corsair 750W PSU',          sku: 'PSU-750-007', category: 'Power',      qty: 62,  price: 110,  reorderLevel: 15, status: 'Good'     },
  { id: 'PRD-007', name: 'Logitech MX Master 3',     sku: 'MSE-MX3-011', category: 'Peripherals', qty: 3,  price: 95,   reorderLevel: 20, status: 'Critical' },
  { id: 'PRD-008', name: 'Fractal Define 7 Case',    sku: 'CAS-FD7-014', category: 'Chassis',     qty: 22,  price: 175,  reorderLevel: 8, status: 'Good'     },
];

export const mockOrders = [
  { id: 'ORD-001', supplier: 'TechParts Global',  items: 5,  total: 28500, date: '2026-04-08', expected: '2026-04-15', status: 'Shipped'   },
  { id: 'ORD-002', supplier: 'ElectroPro Inc',    items: 3,  total: 15200, date: '2026-04-07', expected: '2026-04-14', status: 'Pending'   },
  { id: 'ORD-003', supplier: 'NovaTech Supplies', items: 8,  total: 42800, date: '2026-04-05', expected: '2026-04-12', status: 'Delivered' },
  { id: 'ORD-004', supplier: 'FastDrive Co.',      items: 12, total: 9800,  date: '2026-04-04', expected: '2026-04-11', status: 'Delivered' },
  { id: 'ORD-005', supplier: 'Argon Systems Ltd', items: 2,  total: 32000, date: '2026-04-02', expected: '2026-04-18', status: 'Approved'  },
  { id: 'ORD-006', supplier: 'CoreLink Partners', items: 6,  total: 18400, date: '2026-03-30', expected: '2026-04-06', status: 'Delivered' },
];

export const mockSuppliers = [
  { id: 'SUP-001', name: 'TechParts Global',  contact: 'John Bradley', email: 'john@techparts.com',  phone: '+1-555-0101', status: 'Active', orders: 24 },
  { id: 'SUP-002', name: 'ElectroPro Inc',    contact: 'Sara Chen',    email: 'sara@electropro.com', phone: '+1-555-0202', status: 'Active', orders: 18 },
  { id: 'SUP-003', name: 'NovaTech Supplies', contact: 'Ravi Kumar',   email: 'ravi@novatech.in',    phone: '+91-98001234', status: 'Active', orders: 31 },
  { id: 'SUP-004', name: 'FastDrive Co.',      contact: 'Linda Moore',  email: 'linda@fastdrive.com', phone: '+1-555-0404', status: 'Inactive', orders: 7 },
];

export const aiInsights = [
  { icon: 'Activity', title: 'Demand Forecast', message: 'GPU stock (RTX 4080) is critically low. AI predicts a 340% demand surge next week based on seasonal trends.', severity: 'critical' },
  { icon: 'DollarSign', title: 'Cash Flow Alert', message: 'Revenue is trending 12.4% above forecast. Consider reinvesting ₹5.2L surplus into inventory replenishment.', severity: 'positive' },
  { icon: 'Users', title: 'HR Insight', message: '3 employees in the Technology dept have not logged hours this week. Productivity may be impacted.', severity: 'warning' },
  { icon: 'Truck', title: 'Supply Chain Risk', message: 'Supplier ElectroPro Inc has a pending order past SLA by 2 days. Escalation recommended.', severity: 'warning' },
];

export const deptExpenseData = [
  { dept: 'Technology', value: 38 },
  { dept: 'Sales',      value: 24 },
  { dept: 'Operations', value: 20 },
  { dept: 'HR',         value: 10 },
  { dept: 'Finance',    value: 8  },
];

export const categoryPieData = [
  { name: 'Salaries',    value: 45, color: '#6366f1' },
  { name: 'Procurement', value: 22, color: '#22d3ee' },
  { name: 'Marketing',   value: 14, color: '#8b5cf6' },
  { name: 'Utilities',   value: 9,  color: '#f59e0b' },
  { name: 'Others',      value: 10, color: '#4a5568' },
];

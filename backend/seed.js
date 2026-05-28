import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Product from './models/Product.js';
import Contact from './models/Contact.js';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import Attendance from './models/Attendance.js';
import Leave from './models/Leave.js';
import Salary from './models/Salary.js';
import InventoryLog from './models/InventoryLog.js';
import SupplyNotification from './models/SupplyNotification.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany();
    await Employee.deleteMany();
    await Product.deleteMany();
    await Contact.deleteMany();
    await Order.deleteMany();
    await Transaction.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Salary.deleteMany();
    await InventoryLog.deleteMany();
    await SupplyNotification.deleteMany();

    console.log('👤 Seeding default users...');
    const users = await User.create([
      {
        name: 'Neelima Admin',
        email: 'admin@clouderp.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: 'Priya Sharma',
        email: 'hr@clouderp.com',
        password: 'password123',
        role: 'hr',
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: 'Arjun Mehta',
        email: 'employee@clouderp.com',
        password: 'password123',
        role: 'employee',
        isActive: true,
        isEmailVerified: true,
      }
    ]);
    console.log(`✅ Created ${users.length} users.`);

    console.log('📞 Seeding contacts...');
    const contacts = await Contact.create([
      {
        name: 'TechParts Global',
        email: 'john@techparts.com',
        phone: '+1-555-0101',
        type: 'Supplier',
        company: 'TechParts Global Corp',
        address: 'Tech Hub, Silicon Valley, CA',
      },
      {
        name: 'ElectroPro Inc',
        email: 'sara@electropro.com',
        phone: '+1-555-0202',
        type: 'Supplier',
        company: 'ElectroPro Electronics',
        address: 'Downtown Crossing, Boston, MA',
      },
      {
        name: 'NovaTech Supplies',
        email: 'ravi@novatech.in',
        phone: '+91-98001234',
        type: 'Supplier',
        company: 'NovaTech India Ltd',
        address: 'Tech Park, Bangalore, India',
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        phone: '+91-9988776655',
        type: 'Customer',
        company: 'Retail Solutions',
        address: 'Sector 62, Noida, India',
      }
    ]);
    console.log(`✅ Created ${contacts.length} contacts.`);

    const products = await Product.create([
      {
        name: 'Intel Core i9 Processor',
        sku: 'CPU-I9-001',
        barcode: '890987654321',
        category: 'Electronics',
        price: 48000,
        costPrice: 42000,
        minStock: 10,
        stock: 45,
        unit: 'pcs',
        location: 'Aisle A, Shelf 1',
        description: 'Intel Core i9 14th Gen Desktop Processor',
        supplier: contacts[0]._id,
      },
      {
        name: 'Samsung 32GB DDR5 RAM',
        sku: 'RAM-32-005',
        barcode: '890123456789',
        category: 'Electronics',
        price: 15000,
        costPrice: 11000,
        minStock: 15,
        stock: 8,
        unit: 'pcs',
        location: 'Aisle A, Shelf 3',
        description: 'Samsung High-speed DDR5 desktop memory module',
        supplier: contacts[1]._id,
      },
      {
        name: 'WD 2TB NVMe SSD',
        sku: 'SSD-2T-009',
        barcode: '890111222333',
        category: 'Storage',
        price: 18000,
        costPrice: 14000,
        minStock: 20,
        stock: 120,
        unit: 'pcs',
        location: 'Aisle B, Shelf 2',
        description: 'Western Digital 2TB high performance solid state drive',
        supplier: contacts[0]._id,
      },
      {
        name: 'ASUS RTX 4080 GPU',
        sku: 'GPU-4080-02',
        barcode: '890444555666',
        category: 'Electronics',
        price: 110000,
        costPrice: 95000,
        minStock: 5,
        stock: 5,
        unit: 'pcs',
        location: 'Aisle C, Shelf 1',
        description: 'ASUS ROG Strix GeForce RTX 4080 graphics card',
        supplier: contacts[2]._id,
      },
      {
        name: 'Logitech MX Master 3',
        sku: 'MSE-MX3-011',
        barcode: '890777888999',
        category: 'Peripherals',
        price: 8500,
        costPrice: 6500,
        minStock: 10,
        stock: 3,
        unit: 'pcs',
        location: 'Aisle D, Shelf 4',
        description: 'Logitech MX Master advanced wireless office mouse',
        supplier: contacts[2]._id,
      }
    ]);
    console.log(`✅ Created ${products.length} products.`);

    console.log('📝 Seeding stock adjustment audit logs...');
    await InventoryLog.create([
      {
        product: products[0]._id,
        user: users[0]._id,
        type: 'Stock In',
        quantityChanged: 45,
        previousStock: 0,
        newStock: 45,
        reference: 'Initial Stocking',
        notes: 'Initial warehouse receipt of Intel processors.'
      },
      {
        product: products[1]._id,
        user: users[0]._id,
        type: 'Stock In',
        quantityChanged: 8,
        previousStock: 0,
        newStock: 8,
        reference: 'Initial Stocking',
        notes: 'Initial warehouse receipt of Samsung RAM.'
      },
      {
        product: products[2]._id,
        user: users[0]._id,
        type: 'Stock In',
        quantityChanged: 120,
        previousStock: 0,
        newStock: 120,
        reference: 'Initial Stocking',
        notes: 'Initial warehouse receipt of WD NVMe SSDs.'
      },
      {
        product: products[3]._id,
        user: users[0]._id,
        type: 'Stock In',
        quantityChanged: 5,
        previousStock: 0,
        newStock: 5,
        reference: 'Initial Stocking',
        notes: 'Initial warehouse receipt of ASUS GPUs.'
      },
      {
        product: products[4]._id,
        user: users[0]._id,
        type: 'Stock In',
        quantityChanged: 3,
        previousStock: 0,
        newStock: 3,
        reference: 'Initial Stocking',
        notes: 'Initial warehouse receipt of Logitech mice.'
      }
    ]);

    console.log('🧑 Seeding employee records...');
    const employees = await Employee.create([
      {
        name: 'Arjun Mehta',
        email: 'employee@clouderp.com',
        phone: '+91-9876543210',
        role: 'Engineering Lead',
        department: 'Technology',
        salary: 95000,
        status: 'Active',
        joinDate: new Date('2022-01-15'),
      },
      {
        name: 'Priya Sharma',
        email: 'hr@clouderp.com',
        phone: '+91-8765432109',
        role: 'HR Manager',
        department: 'HR',
        salary: 72000,
        status: 'Active',
        joinDate: new Date('2021-06-20'),
      },
      {
        name: 'Rahul Singh',
        email: 'rahul@clouderp.com',
        phone: '+91-7654321098',
        role: 'Finance Analyst',
        department: 'Finance',
        salary: 68000,
        status: 'Active',
        joinDate: new Date('2023-03-10'),
      },
      {
        name: 'Anika Gupta',
        email: 'anika@clouderp.com',
        phone: '+91-6543210987',
        role: 'Product Designer',
        department: 'Technology',
        salary: 78000,
        status: 'Active',
        joinDate: new Date('2022-09-05'),
      },
      {
        name: 'Dev Kapoor',
        email: 'dev@clouderp.com',
        phone: '+91-5432109876',
        role: 'Supply Chain Mgr',
        department: 'Operations',
        salary: 82000,
        status: 'Active',
        joinDate: new Date('2020-11-30'),
      }
    ]);
    console.log(`✅ Created ${employees.length} employees.`);

    console.log('📅 Seeding employee attendance logs...');
    await Attendance.create([
      { employee: employees[0]._id, date: new Date('2026-05-27'), status: 'Present', checkIn: '09:02', checkOut: '18:05', hoursWorked: 9.05 },
      { employee: employees[0]._id, date: new Date('2026-05-28'), status: 'Present', checkIn: '08:58', checkOut: '18:00', hoursWorked: 9.03 },
      { employee: employees[1]._id, date: new Date('2026-05-27'), status: 'Late', checkIn: '09:45', checkOut: '18:15', hoursWorked: 8.5 },
      { employee: employees[1]._id, date: new Date('2026-05-28'), status: 'Present', checkIn: '09:00', checkOut: '17:30', hoursWorked: 8.5 },
    ]);

    console.log('🌴 Seeding leave logs...');
    await Leave.create([
      { employee: employees[0]._id, leaveType: 'Sick', startDate: new Date('2026-05-10'), endDate: new Date('2026-05-11'), reason: 'Fever recovery', status: 'Approved' },
      { employee: employees[1]._id, leaveType: 'Annual', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-20'), reason: 'Family vacation', status: 'Pending' },
    ]);

    console.log('💵 Seeding payslips...');
    await Salary.create([
      { employee: employees[0]._id, month: 'May 2026', basicSalary: 95000, allowances: 5000, deductions: 2000, netSalary: 98000, status: 'Paid', paymentDate: new Date('2026-05-25') },
      { employee: employees[0]._id, month: 'April 2026', basicSalary: 95000, allowances: 5000, deductions: 2000, netSalary: 98000, status: 'Paid', paymentDate: new Date('2026-04-25') },
      { employee: employees[1]._id, month: 'May 2026', basicSalary: 72000, allowances: 3000, deductions: 1500, netSalary: 73500, status: 'Pending' },
    ]);

    console.log('🛒 Seeding orders & initial financial transactions...');
    
    // Purchase order: buying RAM from Supplier
    const order1 = await Order.create({
      orderNumber: 'ORD-2026-001',
      contact: contacts[1]._id,
      items: [{
        product: products[1]._id,
        quantity: 10,
        price: 15000,
      }],
      totalAmount: 150000,
      type: 'Purchase',
      status: 'Completed',
      orderDate: new Date('2026-04-01'),
    });

    // Transaction for purchase order
    await Transaction.create({
      description: 'Purchase Order: ORD-2026-001 (RAM Purchase)',
      amount: 150000,
      type: 'Expense',
      category: 'Inventory Purchase',
      reference: order1._id,
      date: new Date('2026-04-01'),
    });

    // Sales order: selling GPU to Customer
    const order2 = await Order.create({
      orderNumber: 'ORD-2026-002',
      contact: contacts[3]._id,
      items: [{
        product: products[3]._id,
        quantity: 2,
        price: 110000,
      }],
      totalAmount: 220000,
      type: 'Sales',
      status: 'Completed',
      orderDate: new Date('2026-04-10'),
    });

    // Transaction for sales order
    await Transaction.create({
      description: 'Sales Order: ORD-2026-002 (GPU Sale)',
      amount: 220000,
      type: 'Income',
      category: 'Sales Revenue',
      reference: order2._id,
      date: new Date('2026-04-10'),
    });

    // Seed some standalone transactions for rich charts
    await Transaction.create([
      {
        description: 'Office Rent Payment',
        amount: 45000,
        type: 'Expense',
        category: 'Utilities',
        date: new Date('2026-04-02'),
      },
      {
        description: 'Employee Salaries March',
        amount: 395000,
        type: 'Expense',
        category: 'Salaries',
        date: new Date('2026-04-05'),
      },
      {
        description: 'Software Subscriptions (AWS/Google)',
        amount: 25000,
        type: 'Expense',
        category: 'Utilities',
        date: new Date('2026-04-07'),
      },
      {
        description: 'Consulting Revenue (Q1)',
        amount: 180000,
        type: 'Income',
        category: 'Consulting',
        date: new Date('2026-04-12'),
      }
    ]);

    console.log('🔔 Seeding supply chain notifications...');
    await SupplyNotification.create([
      {
        user: users[0]._id,
        title: 'Shipment Delayed: PO-39102',
        message: 'Order PO-39102 has been marked delayed by BlueDart due to customs clearance hold.',
        type: 'Shipment Alert',
        read: false
      },
      {
        user: users[0]._id,
        title: 'Low Stock Alert: Intel Core i9',
        message: 'Product Intel Core i9 Processor has fallen below the safety stock threshold (10). Current stock: 8.',
        type: 'Low Stock',
        read: false
      }
    ]);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

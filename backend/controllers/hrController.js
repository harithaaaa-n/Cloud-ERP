import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Salary from '../models/Salary.js';
import { createAndSendNotification } from './notificationController.js';
import { sendPayrollEmail } from '../utils/mail.js';

// ── Helpers ────────────────────────────────────────────────────────
const calculateHours = (inStr, outStr) => {
  if (!inStr || !outStr) return 0;
  const [inH, inM] = inStr.split(':').map(Number);
  const [outH, outM] = outStr.split(':').map(Number);
  const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  return Math.max(0, Number((diffMinutes / 60).toFixed(2)));
};

// ────────────────────────────────────────────────────────────────────
// @route   GET /api/hr/employees
// @desc    Get all employees with filters, search, and pagination
// ────────────────────────────────────────────────────────────────────
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Apply Search Filter (Name / Email / Role)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply exact filters
    if (department && department !== 'All') {
      query.department = department;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   GET /api/hr/employees/:id
// @desc    Get single employee details with populated records
// ────────────────────────────────────────────────────────────────────
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Fetch related records
    const attendance = await Attendance.find({ employee: employee._id }).sort({ date: -1 }).limit(30);
    const leaves = await Leave.find({ employee: employee._id }).sort({ startDate: -1 });
    const salaries = await Salary.find({ employee: employee._id }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      data: {
        employee,
        attendance,
        leaves,
        salaries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/hr/employees
// @desc    Create new employee
// ────────────────────────────────────────────────────────────────────
export const createEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await Employee.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   PUT /api/hr/employees/:id
// @desc    Update employee details
// ────────────────────────────────────────────────────────────────────
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   DELETE /api/hr/employees/:id
// @desc    Delete employee & cascade related tables
// ────────────────────────────────────────────────────────────────────
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Cascade delete employee records
    await Attendance.deleteMany({ employee: req.params.id });
    await Leave.deleteMany({ employee: req.params.id });
    await Salary.deleteMany({ employee: req.params.id });

    res.status(200).json({ success: true, message: 'Employee records purged successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/hr/employees/:id/attendance
// @desc    Record daily attendance
// ────────────────────────────────────────────────────────────────────
export const recordAttendance = async (req, res) => {
  const { date, status, checkIn, checkOut } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const hoursWorked = calculateHours(checkIn, checkOut);

    // Upsert attendance record for the date
    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { employee: req.params.id, date: parsedDate },
      { status, checkIn, checkOut, hoursWorked },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/hr/employees/:id/leaves
// @desc    Submit a leave request
// ────────────────────────────────────────────────────────────────────
export const applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const leave = await Leave.create({
      employee: req.params.id,
      ...req.body,
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   PATCH /api/hr/leaves/:leaveId
// @desc    Approve/Reject leave requests
// ────────────────────────────────────────────────────────────────────
export const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update.' });
  }

  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.leaveId,
      { status },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave record not found.' });
    }

    // Reflect status in active employee profile if leave is active now
    if (status === 'Approved') {
      const today = new Date();
      if (today >= new Date(leave.startDate) && today <= new Date(leave.endDate)) {
        await Employee.findByIdAndUpdate(leave.employee, { status: 'On Leave' });
      }
    }
    // Trigger notification
    await createAndSendNotification(
      leave.employee,
      'Leave Request Update',
      `Your leave request has been ${status}.`,
      'System'
    );

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/hr/employees/:id/salaries
// @desc    Issue a monthly payslip
// ────────────────────────────────────────────────────────────────────
export const generateSalary = async (req, res) => {
  const { month, basicSalary, allowances = 0, deductions = 0, status = 'Pending', paymentDate } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

    const salary = await Salary.findOneAndUpdate(
      { employee: req.params.id, month },
      { basicSalary, allowances, deductions, netSalary, status, paymentDate },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: salary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   PATCH /api/hr/salaries/:salaryId
// @desc    Mark payslip as paid
// ────────────────────────────────────────────────────────────────────
export const paySalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.salaryId,
      { status: 'Paid', paymentDate: new Date() },
      { new: true }
    ).populate('employee');
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Payslip record not found.' });
    }

    // Trigger notification
    await createAndSendNotification(
      salary.employee._id,
      'Salary Credited',
      `Your payslip for ${salary.month} of amount ₹${salary.netSalary.toLocaleString('en-IN')} has been marked Paid.`,
      'Payroll'
    );

    // Send payslip notification email asynchronously
    if (salary.employee && salary.employee.email) {
      sendPayrollEmail(salary.employee, salary).catch(err => console.error("Payroll email failed:", err));
    }

    res.status(200).json({ success: true, data: salary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   GET /api/hr/payroll
// @desc    Get all payroll payslips across all employees
// ────────────────────────────────────────────────────────────────────
export const getAllPayslips = async (req, res) => {
  try {
    const salaries = await Salary.find().populate('employee', 'name email role department');
    res.status(200).json({ success: true, count: salaries.length, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

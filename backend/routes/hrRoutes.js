import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  recordAttendance,
  applyLeave,
  updateLeaveStatus,
  generateSalary,
  paySalary,
  getAllPayslips,
} from '../controllers/hrController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { hrSchemas } from '../middleware/validationSchemas.js';

const router = express.Router();

// Enable JWT protection for all HR module endpoints
router.use(protect);

// ── Employee CRUD ─────────────────────────────────────────────────
router.route('/employees')
  .get(authorize('admin', 'hr', 'manager'), getEmployees)
  .post(authorize('admin', 'hr'), validate(hrSchemas.createEmployee), createEmployee);

router.route('/employees/:id')
  .get(authorize('admin', 'hr', 'manager', 'employee'), getEmployeeById)
  .put(authorize('admin', 'hr'), validate(hrSchemas.updateEmployee), updateEmployee)
  .delete(authorize('admin', 'hr'), deleteEmployee);

// ── Attendance Logs ───────────────────────────────────────────────
// Managers, HR and Admin can record; employees cannot self-log attendance
router.post('/employees/:id/attendance', authorize('admin', 'hr', 'manager'), recordAttendance);

// ── Leave Management ──────────────────────────────────────────────
// Employees can apply for their own leave; HR/Admin process approvals
router.post('/employees/:id/leaves', authorize('admin', 'hr', 'employee'), applyLeave);
router.patch('/leaves/:leaveId', authorize('admin', 'hr'), updateLeaveStatus);

// ── Salary / Payroll Logs ─────────────────────────────────────────
router.get('/payroll', authorize('admin', 'hr'), getAllPayslips);
router.post('/employees/:id/salaries', authorize('admin', 'hr'), generateSalary);
router.patch('/salaries/:salaryId', authorize('admin', 'hr'), paySalary);

export default router;

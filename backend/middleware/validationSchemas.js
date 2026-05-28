import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────────────────
const safeString  = (min, max, label) =>
  z.string().trim()
   .min(min, `${label} must be at least ${min} characters`)
   .max(max, `${label} cannot exceed ${max} characters`)
   // Strip angle brackets to prevent stored XSS via text fields
   .transform(v => v.replace(/[<>]/g, ''));

const emailField = z.string().trim().toLowerCase()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

// Strong password: 8+ chars, at least 1 uppercase, 1 lowercase, 1 digit
const strongPassword = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')    // bcrypt max input length
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier');

// ── Auth Schemas ──────────────────────────────────────────────────────────────
export const authSchemas = {
  register: {
    body: z.object({
      name:     safeString(2, 50, 'Name'),
      email:    emailField,
      password: strongPassword,
      role:     z.enum(['admin', 'hr', 'manager', 'employee']).default('employee'),
    }),
  },

  login: {
    body: z.object({
      email:    emailField,
      password: z.string().min(1, 'Password is required').max(72),
    }),
  },

  forgotPassword: {
    body: z.object({
      email: emailField,
    }),
  },

  resetPassword: {
    body: z.object({
      token:    z.string().min(1, 'Reset token is required'),
      password: strongPassword,
    }),
  },

  verifyEmail: {
    body: z.object({
      token: z.string().min(1, 'Verification token is required'),
    }),
  },
};

// ── HR Schemas ────────────────────────────────────────────────────────────────
export const hrSchemas = {
  createEmployee: {
    body: z.object({
      name:       safeString(2, 80, 'Name'),
      email:      emailField,
      department: safeString(1, 100, 'Department'),
      position:   safeString(1, 100, 'Position'),
      salary:     z.number().positive('Salary must be a positive number').max(10_000_000),
      status:     z.enum(['Active', 'Inactive', 'On Leave']).default('Active'),
      phone:      z.string().max(20).optional(),
      joinDate:   z.string().datetime().optional(),
    }),
  },

  generateSalary: {
    body: z.object({
      month:       z.string().min(1, 'Month is required'),
      basicSalary: z.number().positive('Basic salary must be positive').max(10_000_000),
      allowances:  z.number().nonnegative().max(5_000_000).default(0),
      deductions:  z.number().nonnegative().max(5_000_000).default(0),
      status:      z.enum(['Pending', 'Paid']).default('Pending'),
    }),
  },
};

// ── Inventory Schemas ─────────────────────────────────────────────────────────
export const inventorySchemas = {
  createProduct: {
    body: z.object({
      name:     safeString(2, 200, 'Product name'),
      category: safeString(1, 100, 'Category'),
      price:    z.number().nonnegative('Price must be ≥ 0').max(100_000_000),
      stock:    z.number().int().nonnegative('Stock must be an integer ≥ 0').max(10_000_000).optional(),
      minStock: z.number().int().nonnegative('Min stock must be an integer ≥ 0').max(1_000_000).optional(),
      unit:     z.string().max(20).optional(),
    }),
  },

  // All fields optional for PATCH/PUT updates — only validate what is submitted
  updateProduct: {
    body: z.object({
      name:     safeString(2, 200, 'Product name').optional(),
      category: safeString(1, 100, 'Category').optional(),
      price:    z.number().nonnegative('Price must be ≥ 0').max(100_000_000).optional(),
      stock:    z.number().int().nonnegative('Stock must be an integer ≥ 0').max(10_000_000).optional(),
      minStock: z.number().int().nonnegative('Min stock must be an integer ≥ 0').max(1_000_000).optional(),
      unit:     z.string().max(20).optional(),
    }),
  },

  adjustStock: {
    body: z.object({
      type:      z.enum(['Restock', 'Sale', 'Return', 'Damage', 'Audit Adjustment']),
      quantity:  z.number().int().positive('Quantity must be a positive integer').max(1_000_000),
      newStock:  z.number().int().nonnegative().max(10_000_000).optional(),
      reference: z.string().max(200).optional(),
      notes:     z.string().max(500).optional(),
    }),
  },
};

// ── Finance Schemas ───────────────────────────────────────────────────────────
export const financeSchemas = {
  createTransaction: {
    body: z.object({
      amount:      z.number().positive('Transaction amount must be positive').max(100_000_000),
      type:        z.enum(['Income', 'Expense']),
      category:    safeString(1, 100, 'Category'),
      description: z.string().max(500).optional().transform(v => v ? v.replace(/[<>]/g, '') : v),
      date:        z.string().datetime().optional(),
    }),
  },
};

// ── Supply / SCM Schemas ──────────────────────────────────────────────────────
export const supplySchemas = {
  createContact: {
    body: z.object({
      name:    safeString(2, 100, 'Contact name'),
      email:   emailField.optional(),
      phone:   z.string().max(20).optional(),
      type:    z.enum(['Supplier', 'Customer']),
      company: z.string().max(200).optional(),
    }),
  },

  createOrder: {
    body: z.object({
      contact:     mongoId.optional(),
      type:        z.enum(['Purchase', 'Sales']),
      items:       z.array(z.object({
        product:  mongoId,
        quantity: z.number().int().positive().max(1_000_000),
        price:    z.number().nonnegative().max(100_000_000),
      })).min(1, 'Order must contain at least one item'),
      status:      z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).default('Pending'),
    }),
  },
};

// ── Notification Schemas ──────────────────────────────────────────────────────
export const notificationSchemas = {
  createNotification: {
    body: z.object({
      title:   safeString(1, 200, 'Title'),
      message: z.string().min(1).max(1000).transform(v => v.replace(/[<>]/g, '')),
      type:    z.enum(['Low Stock', 'Payroll', 'System', 'Alert', 'Info']).default('Info'),
    }),
  },
};

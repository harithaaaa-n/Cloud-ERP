import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: String, // format "YYYY-MM" or "Month YYYY"
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  allowances: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  paymentDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

// Ensure a single salary payslip per employee per month
salarySchema.index({ employee: 1, month: 1 }, { unique: true });

const Salary = mongoose.model('Salary', salarySchema);
export default Salary;

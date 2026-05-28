import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Designation/role is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Technology', 'Finance', 'HR', 'Sales', 'Operations', 'Marketing'],
    default: 'Technology',
  },
  salary: {
    type: Number,
    required: [true, 'Base salary is required'],
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active',
  },
  profileImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;

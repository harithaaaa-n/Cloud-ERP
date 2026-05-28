import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'On Leave'],
    default: 'Present',
  },
  checkIn: {
    type: String, // format HH:MM
    default: '',
  },
  checkOut: {
    type: String, // format HH:MM
    default: '',
  },
  hoursWorked: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Ensure a single attendance record per employee per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

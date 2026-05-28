const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staff_id: { type: String, ref: 'Staff', required: true },
    shift_id: { type: String, ref: 'Shift', required: true },
    date: { type: Date, required: true },
    clock_in: { type: String, required: true },
    clock_out: { type: String },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'On Leave'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
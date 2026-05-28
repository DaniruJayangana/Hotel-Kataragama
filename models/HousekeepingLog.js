const mongoose = require('mongoose');

const housekeepingLogSchema = new mongoose.Schema({
    room_id: { type: String, ref: 'Room', required: true },
    staff_id: { type: String, ref: 'Staff', required: true },
    clean_date: { type: Date, default: Date.now },
    inspection_status: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' },
    remarks: { type: String, maxlength: 200 }
}, { timestamps: true });

module.exports = mongoose.model('HousekeepingLog', housekeepingLogSchema);
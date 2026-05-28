const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
    room_id: { type: String, ref: 'Room', required: true },
    staff_id: { type: String, ref: 'Staff', required: true }, // Assigned technician
    issue_description: { type: String, required: true },
    estimated_cost: { type: Number, default: 0 },
    status: { type: String, enum: ['Reported', 'In Progress', 'Resolved'], default: 'Reported' }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
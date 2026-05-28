const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "RM101"
    room_type_id: { type: String, ref: 'RoomType', required: true },
    status: { type: String, required: true, enum: ['Available', 'Booked', 'Cleaning', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
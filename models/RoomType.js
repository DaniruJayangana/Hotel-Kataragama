const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "TYP01"
    type_name: { type: String, required: true, enum: ['Single', 'Double', 'Family', 'Suite'] },
    base_price: { type: Number, required: true },
    amenities: [{ type: String }],
    max_occupancy: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);
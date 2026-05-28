const mongoose = require('mongoose');

const additionalServiceSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "SRV01"
    booking_id: { type: String, ref: 'Booking', required: true },
    service_name: { type: String, enum: ['Laundry', 'Spa', 'Tour Guide', 'Transport'], required: true },
    charge_amount: { type: Number, required: true },
    service_date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AdditionalService', additionalServiceSchema);
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "INV-2026-0001"
    booking_id: { type: String, ref: 'Booking', required: true },
    room_charges: { type: Number, required: true },
    restaurant_charges: { type: Number, default: 0 },
    service_charges: { type: Number, default: 0 },
    tax_amount: { type: Number, required: true }, // e.g., VAT
    grand_total: { type: Number, required: true },
    status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
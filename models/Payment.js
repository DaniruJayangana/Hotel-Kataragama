const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "TXN9901"
    invoice_id: { type: String, ref: 'Invoice', required: true },
    payment_method: { type: String, enum: ['Cash', 'Card', 'Online Mobile Pay'], required: true },
    amount_paid: { type: Number, required: true },
    transaction_date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
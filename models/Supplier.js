const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "SUP01"
    supplier_name: { type: String, required: true },
    contact_number: { type: String, required: true },
    email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
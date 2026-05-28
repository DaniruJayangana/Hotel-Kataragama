const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "STF001" (Varchar 10 PK)
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    role: { type: String, required: true },
    hire_date: { type: Date, required: true }, // Format: YYYY-MM-DD
    salary: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
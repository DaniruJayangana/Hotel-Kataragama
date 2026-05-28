const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staff_id: { type: String, ref: 'Staff', required: true },
    pay_period: { type: String, required: true }, // e.g., "2026-05"
    basic_salary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net_salary: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
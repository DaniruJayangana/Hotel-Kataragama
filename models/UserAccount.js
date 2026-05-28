const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
    staff_id: { type: String, ref: 'Staff', required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, minlength: 4 },
    password: { type: String, required: true },
    access_level: { type: String, required: true, enum: ['Admin', 'Receptionist', 'Housekeeping', 'Kitchen Staff'] },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('UserAccount', userAccountSchema);
const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // National ID (NIC) or Passport Number
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    email: { type: String, sparse: true, lowercase: true },
    contact_number: { type: String, required: true, maxlength: 15 }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
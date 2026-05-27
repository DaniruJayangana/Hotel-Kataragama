const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    role: { type: String, required: true, maxlength: 10 },
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    hire_date: { type: Date, required: true },
    department: { type: String, required: true, maxlength: 10 },
    contact_number: { type: String, required: true, maxlength: 10 },
    salary: { type: Number, required: true }
}, { timestamps: true });

// THIS LINE IS CRUCIAL - Don't miss it!
module.exports = mongoose.model('Staff', staffSchema);
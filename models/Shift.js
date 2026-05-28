const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "SHF01"
    shift_name: { type: String, required: true, enum: ['Morning', 'Evening', 'Night'] },
    start_time: { type: String, required: true }, // e.g., "06:00"
    end_time: { type: String, required: true }    // e.g., "14:00"
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
const mongoose = require('mongoose');

// Ensure dependent models are registered for .populate()
require('./Guest');
require('./Room');

const bookingSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "BK0001"
    guest_id: { type: String, ref: 'Guest', required: true },
    room_id: { type: String, ref: 'Room', required: true },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    booking_status: { 
        type: String, 
        enum: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'], 
        default: 'Confirmed' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
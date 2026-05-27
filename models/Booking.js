const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guest_id: { 
        type: String, 
        ref: 'Guest', // Connects directly to the Guest collection
        required: true 
    },
    
    room_id: { 
        type: String, 
        ref: 'Room', // Connects directly to the Room collection
        required: true 
    },
    
    check_in_date: { 
        type: Date, 
        required: true 
    },
    
    check_out_date: { 
        type: Date, 
        required: true 
    },
    
    total_amount: { 
        type: Number, 
        required: true 
    },
    
    booking_status: { 
        type: String, 
        required: true, 
        enum: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'], 
        default: 'Confirmed' 
    },
    
    payment_status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Paid', 'Refunded'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

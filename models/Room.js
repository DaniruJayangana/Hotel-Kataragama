const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true 
    }, // e.g., "RM101", "RM102" (Using Room Number as the unique ID)
    
    room_type: { 
        type: String, 
        required: true, 
        enum: ['Single', 'Double', 'Family', 'Suite'] // Restricts input to only these valid types
    },
    
    price_per_night: { 
        type: Number, 
        required: true 
    },
    
    status: { 
        type: String, 
        required: true, 
        enum: ['Available', 'Booked', 'Cleaning', 'Maintenance'], 
        default: 'Available' // New rooms default to available
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
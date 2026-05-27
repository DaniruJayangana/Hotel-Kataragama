const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true 
    }, // e.g., National ID (NIC) or Passport Number to keep it unique
    
    first_name: { 
        type: String, 
        required: true, 
        maxlength: 50 
    },
    
    last_name: { 
        type: String, 
        required: true, 
        maxlength: 50 
    },
    
    email: { 
        type: String, 
        sparse: true, // Allows the field to be optional but ensures uniqueness if provided
        lowercase: true 
    },
    
    contact_number: { 
        type: String, 
        required: true, 
        maxlength: 15 
    },
    
    emergency_contact: { 
        type: String, 
        maxlength: 15 
    }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
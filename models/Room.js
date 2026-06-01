const mongoose = require('mongoose');

// Ensure the RoomType model is registered so that .populate() 
// can find it when querying for Rooms.
require('./RoomType');

const roomSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "RM101"
    room_type_id: { 
        type: String, 
        ref: 'RoomType', // Must match the name used in mongoose.model('RoomType', ...)
        required: true 
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['Available', 'Booked', 'Cleaning', 'Maintenance'], 
        default: 'Available' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
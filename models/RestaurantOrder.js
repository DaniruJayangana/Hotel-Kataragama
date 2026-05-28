const mongoose = require('mongoose');

const restaurantOrderSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "ORD1001"
    booking_id: { type: String, ref: 'Booking' }, // Optional: null if direct walk-in customer pays cash
    table_number: { type: Number },
    total_amount: { type: Number, required: true, default: 0 },
    order_status: { type: String, enum: ['Pending', 'Cooking', 'Served', 'Paid', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('RestaurantOrder', restaurantOrderSchema);
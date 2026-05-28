const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: { type: String, ref: 'RestaurantOrder', required: true },
    menu_item_id: { type: String, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
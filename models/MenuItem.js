const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "FD001"
    item_name: { type: String, required: true },
    category: { type: String, enum: ['Food', 'Beverage', 'Dessert', 'Extra'], required: true },
    price: { type: Number, required: true },
    is_available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
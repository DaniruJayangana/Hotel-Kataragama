const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "INV001"
    item_name: { type: String, required: true },
    quantity_in_stock: { type: Number, required: true },
    reorder_level: { type: Number, required: true },
    supplier_id: { type: String, ref: 'Supplier', required: true }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
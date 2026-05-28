const express = require('express');
const router = express.Router();
const RestaurantOrder = require('../models/RestaurantOrder');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');

// 1. PLACE A NEW RESTAURANT ORDER (Calculates subtotals & total dynamically)
router.post('/order/create', async (req, res) => {
    try {
        const { order_id, booking_id, table_number, items } = req.body;
        // Expected format for items array: [{ menu_item_id: "FD001", quantity: 2 }]

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Cannot process an empty order. Please add menu items." });
        }

        let totalCalculatedAmount = 0;
        const processedOrderItems = [];

        // Loop through each ordered item to fetch live database prices and calculate costs
        for (const element of items) {
            const menuItem = await MenuItem.findById(element.menu_item_id);
            if (!menuItem) {
                return res.status(404).json({ error: `Menu item ${element.menu_item_id} not found.` });
            }
            if (!menuItem.is_available) {
                return res.status(400).json({ error: `Item '${menuItem.item_name}' is currently sold out.` });
            }

            const itemSubtotal = menuItem.price * element.quantity;
            totalCalculatedAmount += itemSubtotal;

            processedOrderItems.push({
                order_id: order_id,
                menu_item_id: menuItem._id,
                quantity: element.quantity,
                subtotal: itemSubtotal
            });
        }

        // Create and save the master Restaurant Order document
        const newOrder = new RestaurantOrder({
            _id: order_id,
            booking_id: booking_id || null, // Can be null if it's a direct walk-in cash customer
            table_number,
            total_amount: totalCalculatedAmount,
            order_status: 'Pending'
        });
        await newOrder.save();

        // Save all associated sub-items into the OrderItem collection
        await OrderItem.insertMany(processedOrderItems);

        res.status(201).json({
            message: "Restaurant order placed successfully!",
            order_summary: newOrder,
            items_ordered: processedOrderItems
        });
    } catch (err) {
        res.status(500).json({ error: "POS ordering failure", details: err.message });
    }
});

// 2. UPDATE KITCHEN ORDER STATUS (Lifecycle manipulation)
router.put('/order/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'Cooking', 'Served', 'Paid', 'Cancelled'
        const allowedStatuses = ['Pending', 'Cooking', 'Served', 'Paid', 'Cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value provided." });
        }

        const order = await RestaurantOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Restaurant order not found." });
        }

        order.order_status = status;
        await order.save();

        res.status(200).json({ message: `Order status successfully updated to: ${status}`, order });
    } catch (err) {
        res.status(500).json({ error: "Failed to update order status", details: err.message });
    }
});

// 3. GET LIVE KITCHEN DISPLAY SYSTEM (KDS) QUEUE
router.get('/orders/active', async (req, res) => {
    try {
        // Fetch orders that are currently being processed in the kitchen
        const activeOrders = await RestaurantOrder.find({ order_status: { $in: ['Pending', 'Cooking'] } });
        res.status(200).json(activeOrders);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve kitchen queue", details: err.message });
    }
});

// 4. INVENTORY MONITORING: GET LOW STOCK ALERTS
router.get('/inventory/low-stock', async (req, res) => {
    try {
        // Query to check where quantity in stock is equal to or less than the reorder safety line
        const lowStockItems = await InventoryItem.find({
            $expr: { $lte: ["$quantity_in_stock", "$reorder_level"] }
        }).populate('supplier_id', 'supplier_name contact_number');

        res.status(200).json({
            count: lowStockItems.length,
            alerts: lowStockItems
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to run stock analysis report", details: err.message });
    }
});

module.exports = router;
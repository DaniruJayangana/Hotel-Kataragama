const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// Change this line in bookingRoutes.js:
const { authenticate, authorize } = require('../middleware/authMiddleware');
const RestaurantOrder = require('../models/RestaurantOrder');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');

// 1. PLACE A NEW RESTAURANT ORDER
// Secure: Staff can place orders
router.post('/order/create', authenticate, authorize(['Manager', 'Admin']), asyncHandler(async (req, res) => {
    const { booking_id, table_number, items } = req.body;

    if (!items || items.length === 0) {
        const error = new Error("Cannot process an empty order.");
        error.status = 400;
        throw error;
    }

    const orderCount = await RestaurantOrder.countDocuments();
    const generatedOrderId = `ORD${1001 + orderCount}`;

    let totalCalculatedAmount = 0;
    const processedOrderItems = [];

    for (const element of items) {
        const menuItem = await MenuItem.findById(element.menu_item_id);
        if (!menuItem || !menuItem.is_available) {
            const error = new Error(`Item not found or sold out.`);
            error.status = 400;
            throw error;
        }

        const itemSubtotal = menuItem.price * element.quantity;
        totalCalculatedAmount += itemSubtotal;

        processedOrderItems.push({
            order_id: generatedOrderId,
            menu_item_id: menuItem._id,
            quantity: element.quantity,
            subtotal: itemSubtotal
        });
    }

    const newOrder = await RestaurantOrder.create({
        _id: generatedOrderId,
        booking_id: booking_id || null,
        table_number,
        total_amount: totalCalculatedAmount,
        order_status: 'Pending'
    });

    await OrderItem.insertMany(processedOrderItems);

    res.status(201).json({ message: "Order placed!", order_id: generatedOrderId });
}));

// 2. UPDATE KITCHEN ORDER STATUS
router.put('/order/:id/status', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const order = await RestaurantOrder.findByIdAndUpdate(
        req.params.id, 
        { order_status: req.body.status }, 
        { new: true }
    );
    res.status(200).json({ message: "Status updated", order });
}));

// 3. GET ACTIVE KDS QUEUE
router.get('/orders/active', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const activeOrders = await RestaurantOrder.find({ order_status: { $in: ['Pending', 'Cooking'] } });
    res.status(200).json(activeOrders);
}));

// 4. GET TABLES WITH ACTIVE ORDERS
router.get('/orders/active-tables', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const activeTables = await RestaurantOrder.distinct('table_number', { 
        order_status: { $in: ['Pending', 'Cooking', 'Served'] } 
    });
    
    const formattedTables = activeTables.map(t => ({ table_number: t }));
    res.status(200).json(formattedTables);
}));

// 5. GET UNPAID ORDERS FOR ROOM OR TABLE
router.get('/orders/unpaid/:roomOrTable', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const unpaidOrders = await RestaurantOrder.find({
        table_number: req.params.roomOrTable,
        order_status: { $in: ['Pending', 'Cooking', 'Served'] }
    });

    res.status(200).json(unpaidOrders);
}));

// 6. BULK MARK ORDERS AS PAID
router.put('/orders/pay-room/:roomOrTable', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const result = await RestaurantOrder.updateMany(
        {
            table_number: req.params.roomOrTable,
            order_status: { $in: ['Pending', 'Cooking', 'Served'] }
        },
        { $set: { order_status: 'Paid' } }
    );

    res.status(200).json({ message: "Settled", affected: result.modifiedCount });
}));

// 7. GET INVENTORY
router.get('/inventory/all', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    const allItems = await InventoryItem.find({}).populate('supplier_id', 'supplier_name');
    res.status(200).json(allItems);
}));

// NEW: GET LOW STOCK INVENTORY
router.get('/inventory/low-stock', authorize(['Manager', 'Staff']), asyncHandler(async (req, res) => {
    // This assumes your InventoryItem model has 'current_stock' and 'reorder_level' fields
    const lowStockItems = await InventoryItem.find({ 
        $expr: { $lt: ["$current_stock", "$reorder_level"] } 
    });
    
    res.status(200).json(lowStockItems);
}));

module.exports = router;
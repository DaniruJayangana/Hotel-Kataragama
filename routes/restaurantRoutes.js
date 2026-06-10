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
router.post('/order/create', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const { booking_id, table_number, items } = req.body;

    if (!items || items.length === 0) {
        const error = new Error("Cannot process an empty order.");
        error.status = 400;
        throw error;
    }

    const session = await RestaurantOrder.startSession();
    session.startTransaction();

    try {
        const orderCount = await RestaurantOrder.countDocuments();
        const generatedOrderId = `ORD${1001 + orderCount}`;

        let totalCalculatedAmount = 0;
        const processedOrderItems = [];

        for (const element of items) {
            const menuItem = await MenuItem.findById(element.menu_item_id).session(session);
            if (!menuItem || !menuItem.is_available) {
                throw new Error(`Item ${element.menu_item_id} not found or sold out.`);
            }

            // 1. DEDUCT INVENTORY
            if (menuItem.recipe && menuItem.recipe.length > 0) {
                for (const ingredient of menuItem.recipe) {
                    const invItem = await InventoryItem.findById(ingredient.inventory_item_id).session(session);
                    
                    if (!invItem || invItem.quantity_in_stock < (ingredient.quantity_required * element.quantity)) {
                        throw new Error(`Insufficient stock for ingredient: ${invItem?.item_name || ingredient.inventory_item_id}`);
                    }
                    
                    // Subtract from stock
                    invItem.quantity_in_stock -= (ingredient.quantity_required * element.quantity);
                    await invItem.save({ session });
                }
            }

            // 2. PREPARE ORDER DATA
            const itemSubtotal = menuItem.price * element.quantity;
            totalCalculatedAmount += itemSubtotal;

            processedOrderItems.push({
                order_id: generatedOrderId,
                menu_item_id: menuItem._id,
                quantity: element.quantity,
                subtotal: itemSubtotal
            });
        }

        // 3. SAVE ORDER AND ITEMS
        await RestaurantOrder.create([{
            _id: generatedOrderId,
            booking_id: booking_id || null,
            table_number,
            total_amount: totalCalculatedAmount,
            order_status: 'Pending'
        }], { session });

        await OrderItem.insertMany(processedOrderItems, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Order placed and inventory updated!", order_id: generatedOrderId });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}));

// 2. UPDATE KITCHEN ORDER STATUS
router.put('/order/:id/status', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const order = await RestaurantOrder.findByIdAndUpdate(
        req.params.id, 
        { order_status: req.body.status }, 
        { new: true }
    );
    res.status(200).json({ message: "Status updated", order });
}));

// 3. GET ACTIVE KDS QUEUE
router.get('/orders/active', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const activeOrders = await RestaurantOrder.find({ order_status: { $in: ['Pending', 'Cooking'] } });
    res.status(200).json(activeOrders);
}));

// 4. GET TABLES WITH ACTIVE ORDERS
router.get('/orders/active-tables', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const activeTables = await RestaurantOrder.distinct('table_number', { 
        order_status: { $in: ['Pending', 'Cooking', 'Served'] } 
    });
    
    const formattedTables = activeTables.map(t => ({ table_number: t }));
    res.status(200).json(formattedTables);
}));

// 5. GET UNPAID ORDERS FOR ROOM OR TABLE
router.get('/orders/unpaid/:roomOrTable', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const unpaidOrders = await RestaurantOrder.find({
        table_number: req.params.roomOrTable,
        order_status: { $in: ['Pending', 'Cooking', 'Served'] }
    });

    res.status(200).json(unpaidOrders);
}));

// 6. BULK MARK ORDERS AS PAID
router.put('/orders/pay-room/:roomOrTable', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
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
router.get('/inventory/all', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const allItems = await InventoryItem.find({}).populate('supplier_id', 'supplier_name');
    res.status(200).json(allItems);
}));

// NEW: GET LOW STOCK INVENTORY
router.get('/inventory/low-stock', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const lowStockItems = await InventoryItem.find({ 
        $expr: { $lt: ["$quantity_in_stock", "$reorder_level"] } 
    });
    
    res.status(200).json(lowStockItems);
}));

// Add this to restaurantRoutes.js
router.get('/menu', asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({ is_available: true });
    res.status(200).json(menuItems);
}));


module.exports = router;
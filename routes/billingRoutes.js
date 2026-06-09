const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// Using 'authenticate' for login check, 'authorize' for role check
const { authenticate, authorize } = require('../middleware/authMiddleware'); 

// Import Models
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RestaurantOrder = require('../models/RestaurantOrder');
const AdditionalService = require('../models/AdditionalService');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const RoomType = require('../models/RoomType');


// NEW: Added Dashboard Route
router.get('/dashboard', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    res.status(200).json({ 
        message: "Welcome to the secure billing portal!",
        user: req.user.username // Confirms who is logged in
    });
}));

// 1. GENERATE MASTER INVOICE
router.post('/invoice/generate', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const { invoice_id, booking_id } = req.body;

    const booking = await Booking.findById(booking_id).populate({
        path: 'room_id',
        populate: { path: 'room_type_id' }
    });

    if (!booking) {
        const error = new Error("Booking record not found.");
        error.status = 404;
        throw error;
    }

    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const totalNights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24)));

    const basePricePerNight = booking.room_id.room_type_id.base_price;
    const roomCharges = basePricePerNight * totalNights;

    const restaurantOrders = await RestaurantOrder.find({ booking_id, order_status: 'Served' });
    const restaurantCharges = restaurantOrders.reduce((sum, order) => sum + order.total_amount, 0);

    const extraServices = await AdditionalService.find({ booking_id });
    const serviceCharges = extraServices.reduce((sum, service) => sum + service.charge_amount, 0);

    const subtotal = roomCharges + restaurantCharges + serviceCharges;
    const taxAmount = Math.round(subtotal * 0.10);
    const grandTotal = subtotal + taxAmount;

    const newInvoice = await Invoice.create({
        _id: invoice_id,
        booking_id,
        room_charges: roomCharges,
        restaurant_charges: restaurantCharges,
        service_charges: serviceCharges,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: 'Unpaid'
    });

    res.status(201).json({ message: "Master invoice compiled successfully!", invoice: newInvoice });
}));

// 2. PROCESS FINAL CHECKOUT
router.post('/checkout', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const { payment_id, invoice_id, payment_method } = req.body;

    const session = await Invoice.startSession();
    session.startTransaction();

    try {
        const invoice = await Invoice.findById(invoice_id).session(session);
        if (!invoice) throw new Error("Invoice not found.");
        if (invoice.status === 'Paid') throw new Error("This invoice has already been settled.");

        const finalPayment = await Payment.create([{
            _id: payment_id,
            invoice_id,
            payment_method,
            amount_paid: invoice.grand_total
        }], { session });

        invoice.status = 'Paid';
        await invoice.save({ session });

        const booking = await Booking.findByIdAndUpdate(
            invoice.booking_id, 
            { booking_status: 'CheckedOut' }, 
            { session, new: true }
        );

        await Room.findByIdAndUpdate(booking.room_id, { status: 'Cleaning' }, { session });
        
        await RestaurantOrder.updateMany(
            { booking_id: invoice.booking_id, order_status: 'Served' }, 
            { $set: { order_status: 'Paid' } }, 
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Guest checked out successfully!", transaction: finalPayment[0] });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}));

// 3. GET HISTORICAL REVENUE REPORT
router.get('/reports/revenue', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const report = await Payment.aggregate([
        {
            // 1. Filter by date range
            $match: {
                createdAt: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(endDate) 
                }
            }
        },
        {
            // 2. Group by payment method to see how guests prefer to pay
            $group: {
                _id: "$payment_method", 
                totalRevenue: { $sum: "$amount_paid" },
                transactionCount: { $sum: 1 }
            }
        },
        {
            // 3. Project for cleaner output
            $project: {
                _id: 0,
                method: "$_id",
                totalRevenue: 1,
                transactionCount: 1
            }
        }
    ]);

    res.status(200).json(report);
}));

// NEW: GET TOTAL UNPAID REVENUE
router.get('/total', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const unpaidInvoices = await Invoice.find({ status: 'Unpaid' });
    const total = unpaidInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    res.status(200).json({ total });
}));


module.exports = router;
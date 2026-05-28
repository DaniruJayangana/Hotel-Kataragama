const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const RestaurantOrder = require('../models/RestaurantOrder');
const AdditionalService = require('../models/AdditionalService');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// 1. GENERATE MASTER INVOICE (Aggregates costs from Rooms, Restaurant, and Services)
router.post('/invoice/generate', async (req, res) => {
    try {
        const { invoice_id, booking_id } = req.body;

        // A. Fetch Booking details alongside Room and Room Type data
        const booking = await Booking.findById(booking_id).populate({
            path: 'room_id',
            populate: { path: 'room_type_id' }
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking reference record not found." });
        }

        // B. Calculate Room Charges based on stay duration
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        let totalNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
        if (totalNights <= 0) totalNights = 1; // Minimum charge of 1 night

        const basePricePerNight = booking.room_id.room_type_id.base_price;
        const roomCharges = basePricePerNight * totalNights;

        // C. Aggregate all Unpaid Restaurant Orders billed to this room booking
        const restaurantOrders = await RestaurantOrder.find({ 
            booking_id: booking_id, 
            order_status: 'Served' 
        });
        const restaurantCharges = restaurantOrders.reduce((sum, order) => sum + order.total_amount, 0);

        // D. Aggregate all Additional Services utilized (Laundry, Spa, Transport, etc.)
        const extraServices = await AdditionalService.find({ booking_id: booking_id });
        const serviceCharges = extraServices.reduce((sum, service) => sum + service.charge_amount, 0);

        // E. Compute Financial Tax and Totals (e.g., 10% Local Government / Luxury Tax)
        const subtotal = roomCharges + restaurantCharges + serviceCharges;
        const taxAmount = Math.round(subtotal * 0.10); 
        const grandTotal = subtotal + taxAmount;

        // F. Build and save the complete Invoice Document
        const newInvoice = new Invoice({
            _id: invoice_id,
            booking_id,
            room_charges: roomCharges,
            restaurant_charges: restaurantCharges,
            service_charges: serviceCharges,
            tax_amount: taxAmount,
            grand_total: grandTotal,
            status: 'Unpaid'
        });
        await newInvoice.save();

        res.status(201).json({
            message: "Master invoice compiled successfully!",
            invoice: newInvoice,
            breakdown: {
                calculated_nights: totalNights,
                rate_per_night: basePricePerNight
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Invoice generation process failed", details: err.message });
    }
});

// 2. PROCESS FINAL CHECKOUT & RECONCILIATION (Saves payment, flags statuses)
router.post('/checkout', async (req, res) => {
    try {
        const { payment_id, invoice_id, payment_method } = req.body;

        // A. Validate invoice existence
        const invoice = await Invoice.findById(invoice_id);
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found." });
        }
        if (invoice.status === 'Paid') {
            return res.status(400).json({ error: "This invoice has already been settled." });
        }

        // B. Process and log the payment transaction record
        const finalPayment = new Payment({
            _id: payment_id,
            invoice_id: invoice_id,
            payment_method: payment_method, // 'Cash', 'Card', or 'Online Mobile Pay'
            amount_paid: invoice.grand_total
        });
        await finalPayment.save();

        // C. Update Invoice status to Paid
        invoice.status = 'Paid';
        await invoice.save();

        // D. Update Booking status to CheckedOut
        const booking = await Booking.findById(invoice.booking_id);
        booking.booking_status = 'CheckedOut';
        await booking.save();

        // E. Release the Room back to housekeeping cycle ('Cleaning')
        const room = await Room.findById(booking.room_id);
        room.status = 'Cleaning';
        await room.save();

        // F. Mark linked restaurant orders as completely settled
        await RestaurantOrder.updateMany(
            { booking_id: invoice.booking_id, order_status: 'Served' },
            { $set: { order_status: 'Paid' } }
        );

        res.status(200).json({
            message: "Guest checked out successfully! Invoice settled and room flagged for cleaning.",
            transaction_details: finalPayment
        });
    } catch (err) {
        res.status(500).json({ error: "Checkout transaction engine failure", details: err.message });
    }
});

module.exports = router;
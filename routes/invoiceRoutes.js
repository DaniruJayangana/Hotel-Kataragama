const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');

// POST: Generate a new invoice
// Protected: Only Admin/Receptionist can generate bills
router.post('/generate', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const { 
        invoice_id, 
        booking_id, 
        room_charges, 
        restaurant_charges, 
        service_charges, 
        tax_rate // e.g., 15 for 15%
    } = req.body;

    // 1. Verify if the booking exists
    const booking = await Booking.findById(booking_id);
    if (!booking) {
        const error = new Error("Booking not found.");
        error.status = 404;
        throw error;
    }

    // 2. Perform Calculations
    const subtotal = room_charges + restaurant_charges + service_charges;
    const tax_amount = (subtotal * tax_rate) / 100;
    const grand_total = subtotal + tax_amount;

    // 3. Create the Invoice
    const newInvoice = await Invoice.create({
        _id: invoice_id,
        booking_id,
        room_charges,
        restaurant_charges,
        service_charges,
        tax_amount,
        grand_total,
        status: 'Unpaid'
    });

    res.status(201).json({ 
        message: "Invoice generated successfully!", 
        invoice: newInvoice 
    });
}));

// GET: Fetch an invoice by ID
// Protected: Only Admin can view invoices during testing
router.get('/:id', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        const error = new Error("Invoice not found");
        error.status = 404;
        throw error;
    }
    res.status(200).json(invoice);
}));

module.exports = router;
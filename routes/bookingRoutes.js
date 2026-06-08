const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// Both middlewares must be imported and used together
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// 1. CREATE NEW RESERVATION
// FIXED: Updated roles to match 'Admin' and 'Receptionist' from UserAccount.js
router.post('/create', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const { booking_id, guest_nic, first_name, last_name, email, contact_number, room_id, check_in_date, check_out_date } = req.body;

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        // A. Check or register guest
        let guest = await Guest.findById(guest_nic).session(session);
        if (!guest) {
            guest = await Guest.create([{ _id: guest_nic, first_name, last_name, email, contact_number }], { session });
            guest = guest[0];
        }

        // B. Check if the requested room is available
        const room = await Room.findById(room_id).session(session);
        if (!room) {
            const error = new Error("Room not found.");
            error.status = 404;
            throw error;
        }
        if (room.status !== 'Available') {
            const error = new Error(`Room is currently ${room.status}.`);
            error.status = 400;
            throw error;
        }

        // C. Save the new booking
        const newBooking = await Booking.create([{
            _id: booking_id,
            guest_id: guest._id,
            room_id: room._id,
            check_in_date,
            check_out_date
        }], { session });

        // D. Update live room status
        room.status = 'Booked';
        await room.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Booking verified and room secured!", booking: newBooking[0] });
        
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}));

// 2. GET LIVE HOUSE OCCUPANCY DASHBOARD
// FIXED: Updated roles to match 'Admin' and 'Receptionist'
router.get('/dashboard', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const activeBookings = await Booking.find({ booking_status: { $in: ['Confirmed', 'CheckedIn'] } })
        .populate('guest_id', 'first_name last_name contact_number')
        .populate({
            path: 'room_id',
            populate: { path: 'room_type_id', select: 'type_name base_price' }
        });

    res.status(200).json(activeBookings);
}));

// 3. GET ALL ROOMS
// FIXED: Updated roles to match 'Admin' and 'Receptionist'
router.get('/rooms', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const allRooms = await Room.find({});
    res.status(200).json(allRooms);
}));

// 4. UPDATE ROOM STATUS
// FIXED: Updated roles to match 'Admin' and 'Receptionist'
router.put('/rooms/:id/status', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const { status } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        { status: status },
        { new: true }
    );

    if (!updatedRoom) {
        const error = new Error("Room not found");
        error.status = 404;
        throw error;
    }

    res.status(200).json({ message: "Status updated successfully", room: updatedRoom });
}));

// NEW: GET COUNT OF ACTIVE BOOKINGS
router.get('/count', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const count = await Booking.countDocuments({ booking_status: { $in: ['Confirmed', 'CheckedIn'] } });
    res.status(200).json({ count });
}));

// POST /api/bookings/checkin/:id
router.post('/checkin/:id', authenticate, authorize(['Admin', 'Manager', 'Receptionist']), asyncHandler(async (req, res) => {
    
    // Update booking_status to 'CheckedIn'
    // Note: We use booking_status to match your schema exactly
    const booking = await Booking.findByIdAndUpdate(
        req.params.id, 
        { 
            booking_status: 'CheckedIn'
        }, 
        { new: true }
    );

    if (!booking) {
        res.status(404);
        throw new Error("Booking not found");
    }

    res.status(200).json({ 
        message: "Guest checked in successfully", 
        booking 
    });
}));

module.exports = router;
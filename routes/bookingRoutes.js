const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
// Both middlewares must be imported and used together
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const RestaurantOrder = require('../models/RestaurantOrder');

// 1. CREATE NEW RESERVATION
// FIXED: Updated roles to match 'Admin' and 'Receptionist' from UserAccount.js
router.post('/create', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
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
        // Check if any active booking overlaps with the requested dates
        const overlappingBooking = await Booking.findOne({
            room_id: room_id,
            booking_status: { $nin: ['Cancelled', 'CheckedOut'] },
            $or: [
                { 
                    check_in_date: { $lt: new Date(check_out_date) }, 
                    check_out_date: { $gt: new Date(check_in_date) } 
                }
            ]
        }).session(session);

        if (overlappingBooking) {
            const error = new Error("Room is already booked for these dates.");
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
router.get('/dashboard', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
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
router.get('/rooms', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const allRooms = await Room.find({});
    res.status(200).json(allRooms);
}));

// 4. UPDATE ROOM STATUS
// FIXED: Updated roles to match 'Admin' and 'Receptionist'
router.put('/rooms/:id/status', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
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
router.get('/count', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    const count = await Booking.countDocuments({ booking_status: { $in: ['Confirmed', 'CheckedIn'] } });
    res.status(200).json({ count });
}));

// POST /api/bookings/checkin/:id
// 3. CHECK-IN (Updates to 'CheckedIn')
router.post('/checkin/:id', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new Error("Booking not found");

    booking.booking_status = 'CheckedIn';
    await booking.save();
    await Room.findByIdAndUpdate(booking.room_id, { status: 'Occupied' });

    res.status(200).json({ message: "Guest checked in", booking });
}));

// POST /api/bookings/checkout/:id
// 4. CHECK-OUT (Updates to 'Cleaning')
router.post('/checkout/:id', authenticate, authorize(['Admin', 'Receptionist']), asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('room_id');
    if (!booking) throw new Error("Booking not found");

    // Calculate costs
    const restaurantBills = await RestaurantOrder.find({ booking_id: booking._id, order_status: { $ne: 'Paid' } });
    const restaurantTotal = restaurantBills.reduce((acc, order) => acc + order.total_amount, 0);
    
    const nights = Math.max(1, Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 3600 * 24)));
    const roomTotal = nights * (booking.room_id.room_type_id?.base_price || 0);

    // Update statuses
    booking.booking_status = 'CheckedOut';
    await booking.save();
    
    // NEW: Set to 'Cleaning' so Housekeeping knows to check it
    await Room.findByIdAndUpdate(booking.room_id, { status: 'Cleaning' });
    
    await RestaurantOrder.updateMany({ booking_id: booking._id }, { order_status: 'Paid' });

    res.status(200).json({ message: "Checkout successful", finalBill: roomTotal + restaurantTotal });
}));

// POST /api/bookings/cancel/:id
router.post('/cancel/:id', authenticate, authorize(['Admin']), asyncHandler(async (req, res) => {
    // 1. Find the booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new Error("Booking not found");

    // 2. Only allow cancellation if it's still 'Confirmed'
    if (booking.booking_status !== 'Confirmed') {
        res.status(400);
        throw new Error("Only 'Confirmed' bookings can be cancelled.");
    }

    // 3. Update Status
    booking.booking_status = 'Cancelled';
    await booking.save();

    // 4. Release the room back to 'Available'
    await Room.findByIdAndUpdate(booking.room_id, { status: 'Available' });

    res.status(200).json({ message: "Booking cancelled successfully and room is now available." });
}));



module.exports = router;
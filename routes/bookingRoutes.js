const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// 1. CREATE NEW RESERVATION (Collaborative workflow)
router.post('/create', async (req, res) => {
    try {
        const { booking_id, guest_nic, first_name, last_name, email, contact_number, room_id, check_in_date, check_out_date } = req.body;

        // A. Check or register guest details
        let guest = await Guest.findById(guest_nic);
        if (!guest) {
            guest = new Guest({ _id: guest_nic, first_name, last_name, email, contact_number });
            await guest.save();
        }

        // B. Check if the requested room is available
        const room = await Room.findById(room_id);
        if (!room) {
            return res.status(404).json({ error: "Room not found in database." });
        }
        if (room.status !== 'Available') {
            return res.status(400).json({ error: `Room ${room_id} is currently ${room.status} and cannot be booked.` });
        }

        // C. Save the new booking transaction
        const newBooking = new Booking({
            _id: booking_id,
            guest_id: guest._id,
            room_id: room._id,
            check_in_date,
            check_out_date
        });
        await newBooking.save();

        // D. UPDATE LIVE ROOM STATUS (State manipulation link)
        room.status = 'Booked';
        await room.save();

        res.status(201).json({ message: "Booking verified and room secured!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: "Booking system error", details: err.message });
    }
});

// 2. GET LIVE HOUSE OCCUPANCY DASHBOARD (Populates data across 3 linked collections)
router.get('/dashboard', async (req, res) => {
    try {
        const activeBookings = await Booking.find({ booking_status: { $in: ['Confirmed', 'CheckedIn'] } })
            .populate('guest_id', 'first_name last_name contact_number')
            .populate({
                path: 'room_id',
                populate: { path: 'room_type_id', select: 'type_name base_price' }
            });

        res.status(200).json(activeBookings);
    } catch (err) {
        res.status(500).json({ error: "Dashboard compilation failed", details: err.message });
    }
});

module.exports = router;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the required models
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Invoice = require('./models/Invoice');
const RestaurantOrder = require('./models/RestaurantOrder');

const runVerification = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database for state verification...\n");

        console.log("==================================================");
        console.log("        LIVE DATABASE VERIFICATION REPORT         ");
        console.log("==================================================");

        // 1. Check Physical Room Status
        const room = await Room.findById("RM101");
        console.log(`\n[ROOM COLLECTION]`);
        console.log(`Room RM101 Live Status      : \x1b[33m${room ? room.status : 'Not Found'}\x1b[0m (Expected: Cleaning)`);

        // 2. Check Booking Status
        const booking = await Booking.findById("BKG-2026-001");
        console.log(`\n[BOOKINGS COLLECTION]`);
        console.log(`Booking BKG-2026-001 Status : \x1b[32m${booking ? booking.booking_status : 'Not Found'}\x1b[0m (Expected: CheckedOut)`);

        // 3. Check Restaurant Order Status
        const order = await RestaurantOrder.findById("ORD-9901");
        console.log(`\n[RESTAURANT ORDERS COLLECTION]`);
        console.log(`Order ORD-9901 Status       : \x1b[36m${order ? order.order_status : 'Not Found'}\x1b[0m (Expected: Paid)`);

        // 4. Check Invoice Status
        const invoice = await Invoice.findById("INV-5502");
        console.log(`\n[INVOICES COLLECTION]`);
        console.log(`Invoice INV-5502 Status     : \x1b[35m${invoice ? invoice.status : 'Not Found'}\x1b[0m (Expected: Paid)`);
        console.log(`Invoice Grand Total Settled : LKR ${invoice ? invoice.grand_total : 0}`);

        console.log("\n==================================================");
        process.exit(0);
    } catch (err) {
        console.error("Verification script encountered an error:", err.message);
        process.exit(1);
    }
};

runVerification();

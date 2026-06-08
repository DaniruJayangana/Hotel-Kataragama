const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const invoiceRoutes = require('./routes/invoiceRoutes');

dotenv.config();

const app = express();

app.use(helmet()); 
app.use(cors());   
app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => {
        console.error("Database Connection Error: ", err);
        process.exit(1); 
    });

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/invoices', invoiceRoutes);

// --- UPDATED PRODUCTION STATIC FILE SERVING ---
if (process.env.NODE_ENV === 'production') {
    // We point to the root build or skip serving if you are using Vercel/Render for frontend separately
    const buildPath = path.resolve(__dirname, 'frontend', '.next'); 
    
    // Note: Serving a Next.js .next folder directly with express.static is often problematic.
    // It is highly recommended to deploy the frontend as a separate "Static Site" on Render
    // and remove this block entirely.
    console.log("Production mode: API routes are active.");
}

app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
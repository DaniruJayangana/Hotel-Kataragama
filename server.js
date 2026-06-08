const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const invoiceRoutes = require('./routes/invoiceRoutes');

dotenv.config();

const app = express();

// 1. Enhanced Security & Middleware
app.use(helmet()); 

// 2. Configure CORS for Production
// Replace 'https://your-frontend-domain.com' with your actual deployed frontend URL
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Required if you use cookies or authorization headers
};

app.use(cors(corsOptions));
app.use(express.json()); 

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => {
        console.error("Database Connection Error: ", err);
        process.exit(1); 
    });

app.get('/', (req, res) => {
    res.status(200).json({ status: "Hotel Kataragama API is live" });
});

// 4. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/invoices', invoiceRoutes);

// 5. Catch-all for undefined routes
app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

// 6. Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
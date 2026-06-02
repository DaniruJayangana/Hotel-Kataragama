const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet'); // New: Secures your HTTP headers
const errorHandler = require('./middleware/errorHandler'); // New: Your custom error handler
const invoiceRoutes = require('./routes/invoiceRoutes');


// 1. Initialize environment
dotenv.config();

const app = express();

// 2. Security & Parsing Middleware
app.use(helmet()); // Protects against common web vulnerabilities
app.use(cors());   // Allows cross-origin requests
app.use(express.json()); // Processes JSON bodies

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => {
        console.error("Database Connection Error: ", err);
        process.exit(1); // Stop server if DB fails to connect
    });

// 4. Mount Application API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/invoices', invoiceRoutes);

// Replace section 4.5 in your server.js with this:
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, 'frontend', 'build');
    
    // Only serve if the directory exists to prevent crash
    const fs = require('fs');
    if (fs.existsSync(buildPath)) {
        app.use(express.static(buildPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(buildPath, 'index.html'));
        });
    } else {
        console.warn("Build folder not found, skipping static file serving");
    }
}


// 5. Catch-all for undefined routes
app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

// 6. Global Error Handling Middleware
// This must be the very last piece of middleware
app.use(errorHandler);

// 7. Port Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
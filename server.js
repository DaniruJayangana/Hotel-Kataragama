const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const invoiceRoutes = require('./routes/invoiceRoutes');

// 1. Initialize environment
dotenv.config();

const app = express();

// 2. Security & Parsing Middleware
app.use(helmet()); 
app.use(cors());   
app.use(express.json()); 

// 3. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => {
        console.error("Database Connection Error: ", err);
        process.exit(1); 
    });

// 4. Mount Application API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/invoices', invoiceRoutes);

// 5. Production Static File Serving
if (process.env.NODE_ENV === 'production') {
    // Next.js static files are generated in the 'frontend/.next' folder
    // However, if you are using 'output: export', they are in 'frontend/out'
    const buildPath = path.resolve(__dirname, 'frontend', 'out'); 
    
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// 6. Catch-all for undefined routes
app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

// 7. Global Error Handling Middleware
app.use(errorHandler);

// 8. Port Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
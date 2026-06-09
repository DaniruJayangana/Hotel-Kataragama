const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler'); // Import helper
const UserAccount = require('../models/UserAccount');
const Staff = require('../models/Staff');
//const authorize = require('../middleware/authMiddleware');
// We import the authenticate middleware here, though we only use it for routes 
// that require a user to be already logged in (like a potential 'get profile' route).
const { authenticate } = require('../middleware/authMiddleware');

// 1. REGISTER NEW STAFF & ACCOUNT
router.post('/register', asyncHandler(async (req, res) => {
    const { staff_id, first_name, last_name, role, hire_date, salary, username, password, access_level } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Staff record
    const newStaff = await Staff.create({
        _id: staff_id,
        first_name,
        last_name,
        role,
        hire_date,
        salary
    });

    // Create User Account
    const newUserAccount = await UserAccount.create({
        staff_id: newStaff._id,
        username,
        password: hashedPassword,
        access_level
    });

    res.status(201).json({ message: "Staff and User Account created successfully!" });
}));

// 2. STAFF LOGIN
router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await UserAccount.findOne({ username }).populate('staff_id');
    
    if (!user) {
        const error = new Error("Account not found.");
        error.status = 404;
        throw error;
    }
    
    if (!user.is_active) {
        const error = new Error("Account deactivated.");
        error.status = 403;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error("Incorrect password.");
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { userId: user._id, role: user.access_level }, 
        process.env.JWT_SECRET, 
        { expiresIn: '8h' }
    );

    res.status(200).json({
        message: "Login successful!",
        token: token,
        user: {
            username: user.username,
            access_level: user.access_level,
            staff_details: user.staff_id
        }
    });
}));

// Placeholder for Password Recovery
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { username } = req.body;
    const user = await UserAccount.findOne({ username });
    
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // NOTE: To implement this later, you will:
    // 1. Generate a reset token
    // 2. Save token/expiry to user document
    // 3. Send email via Nodemailer
    res.status(200).json({ message: "Recovery email logic will be implemented here." });
}));


module.exports = router;
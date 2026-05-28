const express = require('express');
const router = express.Router();
const UserAccount = require('../models/UserAccount');
const Staff = require('../models/Staff');

// 1. REGISTER NEW STAFF & ACCOUNT (Admin Only Workflow)
router.post('/register', async (req, res) => {
    try {
        const { staff_id, first_name, last_name, role, hire_date, salary, username, password, access_level } = req.body;

        // Create the physical Staff record first
        const newStaff = new Staff({
            _id: staff_id,
            first_name,
            last_name,
            role,
            hire_date,
            salary
        });
        await newStaff.save();

        // Create the digital User Account linked to that staff member
        const newUserAccount = new UserAccount({
            staff_id: newStaff._id,
            username,
            password, // Note: In production, hash this with bcrypt before saving
            access_level
        });
        await newUserAccount.save();

        res.status(201).json({ message: "Staff and User Account created successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
});

// 2. STAFF LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user and populate their physical staff details
        const user = await UserAccount.findOne({ username }).populate('staff_id');
        
        if (!user) {
            return res.status(404).json({ error: "Invalid username or account does not exist." });
        }
        if (!user.is_active) {
            return res.status(403).json({ error: "This account has been deactivated by the administrator." });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: "Incorrect password." });
        }

        // Return access control details to the client application
        res.status(200).json({
            message: "Login successful!",
            user: {
                username: user.username,
                access_level: user.access_level,
                staff_details: user.staff_id
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Login process failed", details: err.message });
    }
});

module.exports = router;
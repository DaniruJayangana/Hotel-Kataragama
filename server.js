// 1. Load the secret environment variables at the very top
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const app = express();
app.use(express.json());

// 2. Read the connection string securely from the hidden .env file
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log("🚀 SUCCESS: Connected safely to the cloud database using secure credentials!"))
    .catch((error) => console.error("❌ Database connection error: ", error));

// A Route to add a new staff member to the database
app.post('/api/staff', async (req, res) => {
    try {
        const newStaff = new Staff({
            _id: req.body.staff_id,
            role: req.body.role,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            hire_date: req.body.hire_date,
            department: req.body.department,
            contact_number: req.body.contact_number,
            salary: req.body.salary
        });

        const savedStaff = await newStaff.save();
        res.status(201).json({ message: "Staff added successfully!", data: savedStaff });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send("Hotel Management System Backend is running securely!");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
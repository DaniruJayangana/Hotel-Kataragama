const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // You will need to: npm install bcryptjs

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Manager', 'Staff', 'Kitchen'], default: 'Staff' }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
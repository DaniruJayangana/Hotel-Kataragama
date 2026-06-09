const jwt = require('jsonwebtoken');

// 1. Authenticate: Verifies if the token is valid (User is logged in)
const authenticate = (req, res, next) => {
    // Standardize header check (handles case-insensitive 'authorization' header)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : null;

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaches the user data (id, role) to the request
        next(); // Proceed to the next middleware/route
    } catch (err) {
        // Distinguish between expired and invalid tokens
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired. Please log in again." });
        }
        res.status(403).json({ error: "Invalid token." });
    }
};

// 2. Authorize: Checks if the logged-in user has the right role
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        // Ensure user was authenticated first
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required." });
        }

        // Check if user's role is in the allowed roles list
        // req.user.role comes from the decoded JWT payload
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: You do not have sufficient permissions." });
        }
        
        next(); // Permission granted
    };
};

module.exports = { authenticate, authorize };
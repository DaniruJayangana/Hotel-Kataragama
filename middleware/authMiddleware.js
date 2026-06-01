const jwt = require('jsonwebtoken');

// 1. Authenticate: Verifies if the token is valid (User is logged in)
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaches the user data (id, role) to the request
        next(); // Proceed to the next middleware/route
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

// 2. Authorize: Checks if the logged-in user has the right role
const authorize = (roles = []) => {
    return (req, res, next) => {
        // Ensure user was authenticated first
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required." });
        }

        // Check if user's role is in the allowed roles list
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient permissions." });
        }
        
        next(); // Permission granted
    };
};

module.exports = { authenticate, authorize };
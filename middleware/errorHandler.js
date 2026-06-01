const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the actual error for debugging

    // Standardized error response
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? err.stack : {} // Only show stack in dev
    });
};

module.exports = errorHandler;
// backend/middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    // This catches any rejected promises and passes them to your fancy error handler
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get Token from Header
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied: No Token Provided');

  try {
    // 2. Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add user ID to the request
    next(); // Let them pass
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
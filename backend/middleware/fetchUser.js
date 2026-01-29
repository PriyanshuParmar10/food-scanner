var jwt = require('jsonwebtoken');
// backend/middleware/fetchUser.js

// 👇 FORCE THE SAME KEY HERE
const JWT_SECRET = process.env.JWT_SECRET; 

// ... rest of your code ...

const fetchUser = (req, res, next) => {
    // Debug Log 1: Did middleware start?
    console.log("🛡️ Auth Middleware Hit");

    const token = req.header('auth-token');
    
    if (!token) {
        console.log("❌ No Token Found in Header");
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        
        // Debug Log 2: Success
        console.log("✅ Token Verified for User:", req.user.id);
        next();
        
    } catch (error) {
        console.log("❌ Invalid Token:", error.message);
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
}

module.exports = fetchUser;
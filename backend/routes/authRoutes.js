const router = require('express').Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// backend/routes/authRoutes.js

// 👇 FORCE THIS KEY
const JWT_SECRET = process.env.JWT_SECRET; 

// ... rest of your code ...

// ==========================
// 1. REGISTER Route (Sign Up)
// ==========================
router.post('/register', async (req, res,next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      inventory: []
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully! Please login." });

  } catch (err) {
    next(err);
  }
});

// ==========================
// 2. LOGIN Route (Sign In) 
// ==========================
router.post('/login', async (req, res,next) => {
  try {
    const { email, password } = req.body;

    // A. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // B. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // C. Create Token (FIXED 🛠️)
    const token = jwt.sign(
      { 
        user: { id: user._id }  // 👈 CRITICAL: Must be inside 'user' object
      }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
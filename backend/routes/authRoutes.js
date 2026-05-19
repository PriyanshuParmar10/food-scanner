const router = require('express').Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res,next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

router.post('/login', async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET; 

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { 
        user: { id: user._id } 
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
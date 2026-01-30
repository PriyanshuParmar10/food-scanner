const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
const PORT = process.env.PORT || 5000;
// Database Connection
// 1. Use the variable from Render, or fallback to local ONLY if it's missing
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-inventory";

console.log("Attempting to connect to:", MONGO_URI.split('@')[1] || "Localhost"); // Secure log

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // This will help us see exactly what the server is seeing
    console.error("Current URI being used:", MONGO_URI.substring(0, 20) + "..."); 
  });

// 👇 Routes
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/shopping', require('./routes/shoppingRoutes')); // Comment out if you don't have this file yet
app.use('/api/products', require('./routes/productRoutes'));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


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
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-inventory")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Debugging: Log every request that hits the server
app.use((req, res, next) => {
  console.log(`📡 Request received: ${req.method} ${req.url}`);
  next();
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


const mongoose = require('mongoose');

// The "Item" inside a user's fridge/cabinet
const InventoryItemSchema = new mongoose.Schema({
  barcode: { type: String, required: true },
  name: { type: String, required: true }, // e.g., "Nivea Face Wash"
  custom_name: { type: String },          // User can nickname it "My Night Cream"
  image: { type: String },
  category: { 
    type: String, 
    enum: ['food', 'beauty'], 
    required: true 
  },
  expiryDate: { type: Date, required: true }, // ⚠️ The most important field
  addedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['active', 'consumed', 'expired'], 
    default: 'active' 
  }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will hash this later
  inventory: [InventoryItemSchema] // 👈 Each user has their own list of items
});

module.exports = mongoose.model('User', UserSchema);
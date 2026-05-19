// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String, default: 'other' }, 
  image: { type: String },
  ingredients: { type: String }, 
  source: { type: String, default: 'user_contribution' } 
});

module.exports = mongoose.model('Product', ProductSchema);
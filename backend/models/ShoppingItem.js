const mongoose = require('mongoose');
const ShoppingItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  isBought: { type: Boolean, default: false },
  healthAnalysis: {
    rating: Number,
    verdict: String,
    alternative: String
  }
});
module.exports = mongoose.model('ShoppingItem', ShoppingItemSchema);
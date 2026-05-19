// backend/models/InventoryItem.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const InventoryItemSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    expiryDate: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
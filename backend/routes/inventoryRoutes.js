const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem'); // Make sure path is correct
const fetchUser = require('../middleware/fetchUser');

router.use((req, res, next) => {
    console.log("🔍 Inventory Router Accessed:", req.url);
    next();
});

// 1. GET ALL ITEMS
router.get('/', fetchUser, async (req, res,next) => {
    try {
        const items = await InventoryItem.find({ user: req.user.id });
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// 👇 2. ADD ITEM (MAKE SURE YOU HAVE THIS!)
router.post('/', fetchUser, async (req, res,next) => {
    console.log("📥 Inventory POST route hit!"); // Debug Log 1
    console.log("📦 Data received:", req.body);  // Debug Log 2

    try {
        const { name, category, quantity, expiryDate, image } = req.body;

        const newItem = new InventoryItem({
            user: req.user.id,
            name,
            category,
            quantity,
            expiryDate,
            image
        });

        const savedItem = await newItem.save();
        console.log("✅ Item saved successfully!"); // Debug Log 3
        res.json(savedItem);

    } catch (err) {
        next(err);
    }
});

// 3. DELETE ITEM
router.delete('/:id', fetchUser, async (req, res,next) => {
    try {
        let item = await InventoryItem.findById(req.params.id);
        if (!item) { return res.status(404).send("Not Found"); }

        // Allow delete only if user owns this item
        if (item.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        item = await InventoryItem.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Item has been deleted", item: item });
    } catch (err) {
        next(err);
    }
});


router.post('/delete-many', fetchUser, async (req, res, next) => { // 👈 Added next
    try {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            res.status(400); // Set status for the middleware to pick up
            throw new Error("Priyanshu, you didn't select any items to delete! 🕵️‍♂️");
        }

        await InventoryItem.deleteMany({ _id: { $in: ids }, user: req.user.id });
        res.json({ message: "Pantry cleared successfully!" });

    } catch (err) {
        next(err); // 👈 This sends the error to your fancy middleware
    }
});

module.exports = router;
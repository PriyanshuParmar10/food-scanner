const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem'); 
const fetchUser = require('../middleware/fetchUser');

router.use((req, res, next) => {
    next();
});

router.get('/', fetchUser, async (req, res,next) => {
    try {
        const items = await InventoryItem.find({ user: req.user.id });
        res.json(items);
    } catch (err) {
        next(err);
    }
});

router.post('/', fetchUser, async (req, res,next) => {

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
        res.json(savedItem);

    } catch (err) {
        next(err);
    }
});

router.delete('/:id', fetchUser, async (req, res,next) => {
    try {
        let item = await InventoryItem.findById(req.params.id);
        if (!item) { return res.status(404).send("Not Found"); }

        if (item.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        item = await InventoryItem.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Item has been deleted", item: item });
    } catch (err) {
        next(err);
    }
});


router.post('/delete-many', fetchUser, async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            res.status(400);
            throw new Error("you didn't select any items to delete! 🕵️‍♂️");
        }

        await InventoryItem.deleteMany({ _id: { $in: ids }, user: req.user.id });
        res.json({ message: "Pantry cleared successfully!" });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
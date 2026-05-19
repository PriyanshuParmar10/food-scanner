const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const ShoppingItem = require('../models/ShoppingItem');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/', fetchUser, async (req, res,next) => {
    try {
        const items = await ShoppingItem.find({ user: req.user.id });
        res.json(items);
    } catch (err) { next(err); }
});

router.post('/', fetchUser, async (req, res,next) => {
    try {
        const newItem = new ShoppingItem({
            name: req.body.name,
            user: req.user.id
        });
        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (err) { next(err); }
});

router.delete('/:id', fetchUser, async (req, res,next) => {
    try {
        await ShoppingItem.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { next(err); }
});

router.put('/:id', fetchUser, async (req, res,next) => {
    try {
        const item = await ShoppingItem.findById(req.params.id);
        item.isBought = !item.isBought;
        await item.save();
        res.json(item);
    } catch (err) { next(err); }
});


router.post('/audit', fetchUser, async (req, res,next) => {

    try {
        const { items, healthProfile } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            Analyze these items for a user with these health conditions: ${healthProfile}.
            Items: ${items.join(", ")}.
            
            Return ONLY a JSON array. 
            Keep the 'alternative' very short (e.g., "Air-popped Popcorn" or "Baked Veggie Straws").
            Structure: [{"name": "item", "rating": 1-5, "verdict": "Safe/Risky", "alternative": "Short suggestion"}]
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/); 
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        res.json(JSON.parse(cleanJson));

    } catch (err) {
       next(err);
    }
});



module.exports = router;
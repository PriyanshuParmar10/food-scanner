// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 
const axios = require('axios');

router.get('/lookup/:barcode', async (req, res) => {
    try {
        const { barcode } = req.params;
        console.log(`📡 Incoming request for barcode: ${barcode}`);

        // 1. Check local DB
        let product = await Product.findOne({ barcode });
        if (product) {
            console.log("✅ Found in Local DB");
            return res.json({ success: true, data: product });
        }

        // 2. Fetch from OpenFoodFacts
        console.log("🔍 Not in DB. Fetching from OpenFoodFacts...");
        const offResponse = await axios.get(
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
        );

        if (offResponse.data.status === 1) {
            const pData = offResponse.data.product;
            
            // 3. Create the object (Mapping the fields carefully)
            const newProductData = {
                barcode,
                name: pData.product_name || pData.generic_name || "Unknown Product",
                brand: pData.brands || "Unknown Brand",
                image: pData.image_url || pData.image_front_url || "https://cdn-icons-png.flaticon.com/512/2553/2553691.png",
                category: pData.categories ? pData.categories.split(',')[0] : "General"
            };

            // 4. Save to DB for next time
            product = new Product(newProductData);
            await product.save();
            
            console.log("💾 Saved new product to DB:", newProductData.name);
            return res.json({ success: true, data: product });
        }

        console.log("❌ Product not found in OpenFoodFacts");
        res.status(404).json({ success: false, message: "Product not found." });

    } catch (err) {
        console.error("🔥 Server Error:", err.message);
        res.status(500).json({ success: false, error: "Search failed" });
    }
});

module.exports = router;
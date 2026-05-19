const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 
const axios = require('axios');

router.get('/lookup/:barcode', async (req, res) => {
    try {
        const { barcode } = req.params;

        let product = await Product.findOne({ barcode });
        if (product) {
            return res.json({ success: true, data: product });
        }

        const offResponse = await axios.get(
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
        );

        if (offResponse.data.status === 1) {
            const pData = offResponse.data.product;
            
            const newProductData = {
                barcode,
                name: pData.product_name || pData.generic_name || "Unknown Product",
                brand: pData.brands || "Unknown Brand",
                image: pData.image_url || pData.image_front_url || "https://cdn-icons-png.flaticon.com/512/2553/2553691.png",
                category: pData.categories ? pData.categories.split(',')[0] : "General"
            };

            product = new Product(newProductData);
            await product.save();
            
            return res.json({ success: true, data: product });
        }

        res.status(404).json({ success: false, message: "Product not found." });

    } catch (err) {
        res.status(500).json({ success: false, error: "Search failed" });
    }
});

module.exports = router;
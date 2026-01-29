const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 👇 PASTE YOUR API KEY HERE (In a real app, use .env, but this is fine for now)

// This tells Node to look inside the .env file instead
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 👇 UPDATED RECIPE ROUTE (Accepts Cuisine & Meal Type)
router.post('/recipe', async (req, res) => {
  try {
    const { ingredients, cuisine, mealType, difficulty } = req.body;
    
    // Use the alias that works for you
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Act as a world-class Michelin star chef.
      
      The user wants to cook a: ${mealType || "Meal"}
      Preferred Cuisine: ${cuisine || "Any"}
      Difficulty Level: ${difficulty || "Easy"}
      
      Available Ingredients: ${ingredients.join(", ")}.
      
      Task: Create a creative, delicious recipe using these ingredients. 
      You can assume they have basic pantry staples (salt, oil, pepper, water).
      
      Format the response in Markdown:
      1. Catchy Title (with emoji)
      2. "Why this works" (one sentence)
      3. Ingredients List
      4. Step-by-Step Instructions
      5. Chef's Secret Tip at the end.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recipe: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chef is busy burning water." });
  }
});

// 👇 NEW ROUTE: Health Analyzer
router.post('/analyze', async (req, res,next) => {
  try {
    const { productName, healthConditions } = req.body;
    
    // Use the alias that worked for you
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Act as a strict nutritionist. 
      Product: "${productName}"
      User's Health Issues: ${healthConditions || "None"}

      Analyze this product. 
      1. List top 5 likely ingredients.
      2. Give a Health Rating (1-5 stars) specifically for this user.
      3. Verdict: Is it "Safe", "Moderate", or "Risky" for them?
      4. Explanation: One short sentence why (mention specific ingredients like Sugar or Salt).
      5. Alternative: Name one healthier alternative product they could buy instead.

      Return the response in this exact JSON format (no markdown, just raw JSON):
      {
        "ingredients": ["ing1", "ing2"],
        "rating": 3,
        "verdict": "Moderate",
        "explanation": "Reason here...",
        "alternative": "Alternative Product Name"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Clean up the text to ensure it's valid JSON
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    res.json(JSON.parse(text));
    
  } catch (err) {
    next(err);
  }
});
router.post('/extract-barcode', async (req, res) => {
    try {
        const { image } = req.body; // Base64 string from frontend

        // Use 'gemini-1.5-flash' for maximum speed
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Remove the data URL prefix if it exists (e.g., "data:image/jpeg;base64,")
        const base64Data = image.split(",")[1] || image;

        const prompt = "Extract the 13-digit EAN/UPC barcode number from this image. Only return the digits, no text.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                }
            }
        ]); //

        const response = await result.response;
        const barcode = response.text().trim(); //

        // Only return if it's a valid number
        if (/^\d+$/.test(barcode)) {
            console.log("🎯 AI Extracted Barcode:", barcode);
            return res.json({ barcode });
        }

        res.json({ barcode: null });
    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ error: "Vision processing failed" });
    }
});
module.exports = router;
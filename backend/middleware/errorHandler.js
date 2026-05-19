const funnyTips = [
    "The Chef burned the water again... try refreshing! 🔥",
    "Chef is currently taking a nap in the pantry. 😴",
    "Someone spilled milk on the servers. One sec! 🥛",
    "The AI is arguing with a microwave. Try again? 🤖",
    "Your ingredients are too powerful for the AI to handle! ⚡",
    "Chef is currently searching for his lost spatula. 🍳"
];

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let tip = "Chef is currently on a tea break.";

    if (req.originalUrl.includes('analyze')) {
        tip = "The AI Nutritionist is currently eating a donut. Don't tell! 🍩";
    } else if (req.originalUrl.includes('lookup')) {
        tip = "The barcode is playing hide and seek. Try better lighting! 🔦";
    } else if (req.originalUrl.includes('audit')) {
        tip = "The shopping cart has a wobbly wheel. One second... 🛒";
    } else {
        tip = "The AI is currently arguing with the toaster. 🤖";
    }

    res.status(statusCode).json({
        success: false,
        error: { message: err.message || "Server Hiccup" },
        tip: tip
    });
};

module.exports = errorHandler;
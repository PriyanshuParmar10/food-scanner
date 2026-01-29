import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
// 1. Add these imports for the animations
import { motion, AnimatePresence } from "framer-motion";

const Chef = () => {
  const [items, setItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  
  const [cuisine, setCuisine] = useState("Any");
  const [mealType, setMealType] = useState("Dinner");
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [recipe, setRecipe] = useState("");
  const [cooking, setCooking] = useState(false);

  // Your Alert State
  const [alert, setAlert] = useState({ message: "", tip: "" });

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        headers: { "auth-token": token }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleIngredient = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleCook = async () => {
    if (selectedIngredients.length === 0) return setAlert({ message: "Empty Pot!", tip: "Pick at least one ingredient before cooking!" });
    
    setCooking(true);
    setRecipe("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/recipe`, {
        ingredients: selectedIngredients,
        cuisine,
        mealType,
        difficulty
      });
      setRecipe(res.data.recipe);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || "Chef burned the food.";
      const funnyTip = err.response?.data?.tip || "The AI is currently arguing with a microwave.";
      
      setAlert({ message: errorMsg, tip: funnyTip });
      setTimeout(() => setAlert({ message: "", tip: "" }), 5000);
    } finally {
      setCooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 md:pl-8 font-sans selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 pt-16">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4">
          Master Chef AI
        </h1>
        <p className="text-slate-400 text-lg">
          Select your ingredients, pick a style, and let the AI invent a masterpiece.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span> Chef Settings
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Meal Type</label>
                        <select 
                            value={mealType} 
                            onChange={(e) => setMealType(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none [&>option]:bg-slate-900"
                        >
                            <option value="Breakfast">Breakfast 🥞</option>
                            <option value="Lunch">Lunch 🥪</option>
                            <option value="Dinner">Dinner 🍝</option>
                            <option value="Snack">Snack 🍿</option>
                            <option value="Dessert">Dessert 🧁</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Cuisine Style</label>
                        <select 
                            value={cuisine} 
                            onChange={(e) => setCuisine(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none [&>option]:bg-slate-900"
                        >
                            <option value="Any">Surprise Me 🎲</option>
                            <option value="Indian">Indian 🇮🇳</option>
                            <option value="Italian">Italian 🇮🇹</option>
                            <option value="Mexican">Mexican 🇲🇽</option>
                            <option value="Chinese">Chinese 🇨🇳</option>
                            <option value="Healthy">Super Healthy 🥗</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Easy', 'Medium', 'Hard'].map((lvl) => (
                                <button 
                                    key={lvl}
                                    onClick={() => setDifficulty(lvl)}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                        difficulty === lvl 
                                        ? "bg-orange-500 text-white border-orange-500" 
                                        : "bg-transparent border-white/10 text-slate-500"
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleCook}
                disabled={cooking}
                className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3
                ${cooking ? "bg-slate-800 cursor-not-allowed text-slate-500" : "bg-gradient-to-r from-orange-500 to-red-600 text-white"}`}
            >
                {cooking ? "Chef is Thinking..." : "👨‍🍳Chef GENERATE RECIPE"}
            </button>
        </div>

        {/* RIGHT COLUMN: INGREDIENTS */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Select Ingredients</h3>
                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-slate-300">
                        {selectedIngredients.length} Selected
                    </span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {items.map(item => (
                        <button
                            key={item._id}
                            onClick={() => toggleIngredient(item.name)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                selectedIngredients.includes(item.name)
                                ? "bg-orange-500/20 border-orange-500 text-orange-400"
                                : "bg-white/5 border-white/5 text-slate-400"
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </div>

            {recipe && (
                <div className="bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-fade-in-up">
                    <ReactMarkdown className="prose prose-invert prose-orange max-w-none">{recipe}</ReactMarkdown>
                </div>
            )}
        </div>
      </div>

      {/* 2. THE ALERT CALL: It only renders if alert.message exists */}
      <AnimatePresence>
        {alert.message && (
          <ChefAlert 
            message={alert.message} 
            tip={alert.tip} 
            onClose={() => setAlert({ message: "", tip: "" })} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 3. DEFINE THE COMPONENT HERE (Outside the main Chef component)
const ChefAlert = ({ message, tip, onClose }) => {
  return (
    <motion.div 
      // 👇 Changed animation to slide down from the top
      initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
      exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
      // 👇 Changed classes to position it Top-Center
      className="fixed top-10 left-1/2 z-[200] w-full max-w-sm px-4"
    >
      <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20">
        <div className="flex items-start gap-4">
          <span className="text-3xl animate-bounce">👨‍🍳</span>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Kitchen Accident!</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">{message}</p>
            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
              <p className="text-orange-400 text-[10px] font-bold italic">“{tip}”</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Chef;
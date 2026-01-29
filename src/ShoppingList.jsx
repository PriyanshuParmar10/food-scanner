import { useEffect, useState } from "react";
import axios from "axios";

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [auditing, setAuditing] = useState(false);
  
  const healthProfile = JSON.parse(localStorage.getItem("healthProfile") || "{}");

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shopping`, { headers: { "auth-token": token } });
        setItems(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shopping`, { name: newItem }, { headers: { "auth-token": token } });
    setItems([...items, res.data]);
    setNewItem("");
  };

  const deleteItem = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/shopping/${id}`, { headers: { "auth-token": token } });
    setItems(items.filter(i => i._id !== id));
  };

  const toggleBought = async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/shopping/${id}`, {}, { headers: { "auth-token": token } });
    setItems(items.map(i => i._id === id ? res.data : i));
  };

  const swapItem = async (originalId, newName) => {
     // 1. Delete the bad item
     await deleteItem(originalId);
     // 2. Add the healthy alternative
     const token = localStorage.getItem("token");
     const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shopping`, { name: newName }, { headers: { "auth-token": token } });
     setItems(prev => [...prev, res.data]);
  };

  const runHealthAudit = async () => {
    if (items.length === 0) return alert("Add items first!");
    setAuditing(true);
    const token = localStorage.getItem("token");
    const activeConditions = Object.keys(healthProfile).filter(k => healthProfile[k]).join(", ");
    const itemNames = items.map(i => i.name);

    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shopping/audit`, 
            { items: itemNames, healthProfile: activeConditions }, 
            { headers: { "auth-token": token } }
        );
        
        const auditedItems = items.map(item => {
            const analysis = res.data.find(a => a.name.toLowerCase() === item.name.toLowerCase());
            return analysis ? { ...item, healthAnalysis: analysis } : item;
        });
        setItems(auditedItems);


    } catch (err) {
        if (err.response?.status === 429) {
            alert("The AI Chef is currently on a break (Rate Limit). Try again in a bit!");
        } else {
            alert("Chef burned the food. Try again.");
        }
    } finally {
        setAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 md:pl-8 font-sans">
        <div className="max-w-4xl mx-auto pt-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Smart List 🛒</h1>
                    <p className="text-slate-500 mt-1">Plan your shopping with AI-powered health insights.</p>
                </div>
                <button 
                    onClick={runHealthAudit}
                    disabled={auditing || items.length === 0}
                    className={`px-6 py-3 rounded-full font-bold transition-all ${auditing ? "bg-slate-800 text-slate-500" : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"}`}
                >
                    {auditing ? "Analyzing..." : "✨ Audit Health"}
                </button>
            </div>

            <form onSubmit={addItem} className="mb-8 relative">
                <input 
                    type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add item (e.g., Chips, Coke)..."
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-4 text-lg focus:border-green-500 outline-none"
                />
                <button type="submit" className="absolute right-3 top-3 bg-white/10 w-10 h-10 rounded-xl">+</button>
            </form>

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item._id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.isBought ? "opacity-40" : item.healthAnalysis?.verdict === 'Risky' ? "bg-red-500/5 border-red-500/30" : "bg-[#0A0A0A] border-white/5"}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => toggleBought(item._id)} className={`w-6 h-6 rounded-full border-2 ${item.isBought ? "bg-green-500 border-green-500" : "border-slate-600"}`}>
                                {item.isBought && "✓"}
                            </button>
                            <span className={`text-lg font-bold ${item.isBought ? "line-through text-slate-600" : ""}`}>{item.name}</span>
                            {item.healthAnalysis && !item.isBought && (
                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-black ${item.healthAnalysis.verdict === 'Safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {item.healthAnalysis.verdict}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {item.healthAnalysis?.alternative && !item.isBought && (
                                <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                                    <span className="text-xs text-slate-400">Better:</span>
                                    <span className="text-green-400 font-bold text-sm">{item.healthAnalysis.alternative}</span>
                                    <button onClick={() => swapItem(item._id, item.healthAnalysis.alternative)} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded">SWAP</button>
                                </div>
                            )}
                            <button onClick={() => deleteItem(item._id)} className="text-slate-600 hover:text-red-500">🗑</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ShoppingList;
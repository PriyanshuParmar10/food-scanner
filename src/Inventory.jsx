import { useEffect, useState } from "react";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";
import AlertToast from "./AlertToast";
import { createPortal } from "react-dom";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [viewingItem, setViewingItem] = useState(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [alertState, setAlertState] = useState({ message: "", tip: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, type: null });

  const [healthProfile, setHealthProfile] = useState(() => {
    const saved = localStorage.getItem("healthProfile");
    return saved ? JSON.parse(saved) : {
      diabetes: false, bp: false, gluten: false, vegan: false, lactose: false
    };
  });

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [isChefThinking, setIsChefThinking] = useState(false);

  useEffect(() => { fetchInventory(); }, []);
  useEffect(() => { localStorage.setItem("healthProfile", JSON.stringify(healthProfile)); }, [healthProfile]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        headers: { "auth-token": token },
      });
      setItems(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const toggleHealth = (key) => setHealthProfile({ ...healthProfile, [key]: !healthProfile[key] });

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    selectedIds.includes(id) 
      ? setSelectedIds(selectedIds.filter(i => i !== id)) 
      : setSelectedIds([...selectedIds, id]);
  };

  const analyzeItem = async (productName) => {
    setAnalyzing(true);
    setAnalysis(null);
    const conditions = Object.keys(healthProfile).filter(k => healthProfile[k]).map(k => k === 'bp' ? 'High Blood Pressure' : k).join(", ");
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, { productName, healthConditions: conditions });
        setAnalysis(response.data);
    } catch (err) {
      setAlertState({ 
        message: "AI Nutritionist Busy", 
        tip: err.response?.data?.tip || "Chef is taking a quick break! 🍩" 
      });
      setTimeout(() => setAlertState({ message: "", tip: "" }), 3000);
    } 
    finally { setAnalyzing(false); }
  };

  useEffect(() => {
    if (viewingItem) analyzeItem(viewingItem.name);
    else setAnalysis(null); 
  }, [viewingItem]);

  const triggerDelete = (id) => setConfirmState({ isOpen: true, id, type: 'single' });
  const triggerBulkDelete = () => setConfirmState({ isOpen: true, id: null, type: 'bulk' });

  const handleConfirmedAction = async () => {
    const { id, type } = confirmState;
    setConfirmState({ isOpen: false, id: null, type: null });
    
    try {
        const token = localStorage.getItem("token");
        if (type === 'single') {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/inventory/${id}`, { headers: { "auth-token": token } });
            setItems(items.filter(item => item._id !== id));
            setViewingItem(null);
        } else {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/inventory/delete-many`, { ids: selectedIds }, { headers: { "auth-token": token } });
            setItems(items.filter(item => !selectedIds.includes(item._id)));
            setSelectedIds([]);
        }
        
        setAlertState({ message: "Action Successful", tip: "Your pantry has been updated! ✨" });
        setTimeout(() => setAlertState({ message: "", tip: "" }), 3000);
    } catch (err) {
        setAlertState({ message: "Task Failed", tip: "The kitchen is a bit chaotic right now. Try again!" });
    }
  };

  const handleGenerateRecipe = async () => {
    if (selectedIds.length === 0) {
        setAlertState({ message: "Empty Pot!", tip: "Pick ingredients before cooking! 💨" });
        return;
    }
    setIsChefThinking(true);
    setRecipe(""); 
    const ingredients = items.filter(item => selectedIds.includes(item._id)).map(item => item.name);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/recipe`, { ingredients });
      setRecipe(response.data.recipe);
    } catch (error) { 
        setAlertState({ message: "Kitchen Accident", tip: "Chef burned the water. Try again!" });
    } 
    finally { setIsChefThinking(false); }
  };

  const activeHealthCount = Object.values(healthProfile).filter(Boolean).length;

  const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#111] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl ring-1 ring-white/10"
          >
            <h3 className="text-xl font-black text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all">Cancel</button>
              <button onClick={onConfirm} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black shadow-lg shadow-red-600/20 transition-all">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-screen pb-24 font-sans bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500/30">

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-2">My Pantry</h2>
            <p className="text-slate-500 font-medium tracking-wide text-sm">Your intelligent kitchen assistant.</p>
          </div>
          
          <button onClick={() => setIsHealthModalOpen(true)} className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 px-6 py-3 rounded-full transition-all duration-300 active:scale-95">
            <div className={`w-2 h-2 rounded-full ${activeHealthCount > 0 ? "bg-red-500 animate-pulse" : "bg-slate-600"}`}></div>
            <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Health Profile</p>
                <p className="text-sm font-bold text-white leading-none">{activeHealthCount === 0 ? "Configure Issues" : `${activeHealthCount} Active Alerts`}</p>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors">→</span>
          </button>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div></div>
        ) : items.length === 0 ? (
            <div className="text-center py-24 col-span-full opacity-50 flex flex-col items-center">
                <span className="text-6xl mb-4">📦</span>
                <h3 className="text-2xl font-bold text-white mb-2">Pantry is Empty</h3>
                <a href="/scan" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-all border border-white/10">Add First Item</a>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
                const isSelected = selectedIds.includes(item._id);
                return (
                <div key={item._id} onClick={() => setViewingItem(item)} className={`relative group cursor-pointer rounded-3xl p-5 border backdrop-blur-xl transition-all duration-500 ease-out ${isSelected ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] scale-[1.02]" : "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 hover:-translate-y-1"}`}>
                    <div className="w-full h-32 bg-white/5 rounded-2xl flex items-center justify-center mb-4 overflow-hidden relative">
                        <img src={item.image || "https://cdn-icons-png.flaticon.com/512/2553/2553691.png"} alt={item.name} className="w-20 h-20 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg text-white/90 tracking-tight leading-tight truncate">{item.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</p>
                    </div>
                    <div onClick={(e) => toggleSelect(e, item._id)} className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${isSelected ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/40" : "bg-black/20 border-white/10 hover:border-white/30 text-transparent"}`}>
                        <svg className={`w-4 h-4 text-white transform transition-transform ${isSelected ? "scale-100" : "scale-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                </div>
                );
            })}
            </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
          <button onClick={handleGenerateRecipe} disabled={isChefThinking} className="bg-white text-black hover:bg-slate-200 font-black py-4 px-10 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
            {isChefThinking ? "Cooking..." : `👨‍🍳 Cook with ${selectedIds.length} Items`}
          </button>
          <button onClick={triggerBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all">🗑️ Clear Selected</button>
        </div>
      )}

      <AnimatePresence>
        {isHealthModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsHealthModalOpen(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0F0F0F] w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl p-8 ring-1 ring-white/5" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <div><h3 className="text-2xl font-black text-white">Health Profile</h3><p className="text-slate-500 text-sm">Customize your AI nutritionist.</p></div>
                      <button onClick={() => setIsHealthModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                      {Object.keys(healthProfile).map(key => (
                          <button key={key} onClick={() => toggleHealth(key)} className={`relative flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-bold transition-all border ${healthProfile[key] ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>
                              <span className="text-2xl">{key === 'diabetes' ? '🍭' : key === 'bp' ? '💓' : key === 'gluten' ? '🍞' : key === 'vegan' ? '🌿' : '🥛'}</span>
                              <span className="capitalize text-xs tracking-widest">{key === 'bp' ? 'High BP' : key}</span>
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setIsHealthModalOpen(false)} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">SAVE CHANGES</button>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setViewingItem(null)}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-[#0A0A0A] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl relative grid md:grid-cols-2 overflow-hidden ring-1 ring-white/5" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                  <div className="w-48 h-48 bg-white rounded-[2rem] flex items-center justify-center mb-8 p-6 shadow-2xl"><img src={viewingItem.image || "https://cdn-icons-png.flaticon.com/512/2553/2553691.png"} alt={viewingItem.name} className="w-full h-full object-contain" /></div>
                  <h2 className="text-3xl font-black text-white text-center">{viewingItem.name}</h2>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">{viewingItem.category}</span>
                </div>
                <div className="p-8 flex flex-col h-full bg-[#0F0F0F]">
                   <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-6">✨ AI Analysis</span>
                   {analyzing ? <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto"></div> : analysis && (
                      <div className="p-4 rounded-2xl border bg-green-500/10 border-green-500/20"><p className="text-slate-300 text-sm leading-relaxed">{analysis.explanation}</p></div>
                   )}
                   <button onClick={() => triggerDelete(viewingItem._id)} className="w-full mt-auto text-red-500/50 hover:text-red-400 text-xs font-bold uppercase py-3 transition-colors">Delete Item from Pantry</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'bulk' ? "Clear Pantry?" : "Remove Item?"}
        message="This action is permanent. Are you sure you want to proceed?"
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmState({ isOpen: false, id: null, type: null })}
      />
      
{alertState.message && createPortal(
  <div className="fixed inset-0 pointer-events-none z-[9999] flex justify-center pt-10">
    <AnimatePresence>
      <motion.div

        initial={{ y: -50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300,
          
          layout: { duration: 0.3 } 
        }}
        
        className="pointer-events-auto w-full max-w-sm flex justify-center"
      >
        <AlertToast 
          message={alertState.message} 
          tip={alertState.tip} 
          type="health" 
          onClose={() => setAlertState({ message: "", tip: "" })} 
        />
      </motion.div>
    </AnimatePresence>
  </div>,
  document.body
)}
    </div>
  );
};

export default Inventory;
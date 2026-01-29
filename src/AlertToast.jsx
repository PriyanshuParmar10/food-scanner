// src/components/AlertToast.jsx
import { motion, AnimatePresence } from "framer-motion";

const AlertToast = ({ message, tip, type, onClose }) => {
  // 🎭 Switch emoji based on where the error came from
  const getIcon = () => {
    if (type === "scan") return "📸";
    if (type === "health") return "🏥";
    if (type === "list") return "🛒";
    return "👨‍🍳";
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
          className="fixed top-10 left-1/2 z-[300] w-full max-w-sm px-4"
        >
          <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl ring-1 ring-white/20">
            <div className="flex items-start gap-4">
              <span className="text-3xl animate-bounce">{getIcon()}</span>
              <div className="flex-1">
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">
                   System Alert
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{message}</p>
                {tip && (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <p className="text-blue-400 text-[10px] font-bold italic">“{tip}”</p>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertToast;
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const SOUNDS = {
  pop: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  shy: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
  crunch: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3", 
};

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isHappy, setIsHappy] = useState(false);
  const [isShy, setIsShy] = useState(false);
  const [isFed, setIsFed] = useState(false); // Game State

  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (focusedInput === "email") return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, focusedInput]);

  const playSound = (type) => {
    const audio = new Audio(SOUNDS[type] || SOUNDS.pop);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleFocus = (field) => {
    setFocusedInput(field);
    if (field === "password") {
      setIsShy(true);
      playSound("shy");
    } else if (field === "email") {
      animate(mouseX, 0.8); 
      animate(mouseY, 0.5);
    }
  };

  const handleBlur = () => {
    setFocusedInput(null);
    setIsShy(false);
  };

  // Feature: Manually Feed the Bag
  const handleFeed = () => {
    if (isFed) return; 
    setIsFed(true);
    setIsHappy(true); 
    playSound("pop");
    
    // Reset after 3 seconds
    setTimeout(() => {
        setIsFed(false);
        setIsHappy(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    setIsHappy(true); 
    setIsShy(false);
    setIsFed(true); 
    playSound("pop");
    
    setTimeout(() => {
        setIsHappy(false);
        setIsFed(false);
    }, 3000);

    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth${endpoint}`, payload);
      if (!isLogin) {
        setIsLogin(true);
        setError("Account created! 🚀 Please log in.");
      } else if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        onLoginSuccess(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong 😢");
      setIsHappy(false);
      setIsFed(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F1115] text-white overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* ========================================= */}
      {/* LEFT SIDE: THE HUNGRY SQUAD (60%)         */}
      {/* ========================================= */}
      <div className="hidden lg:flex w-[60%] relative items-center justify-center overflow-hidden bg-[#0B0D11]">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[120px]"></div>

        {/* THE SQUAD */}
        <div className="relative w-[500px] h-[500px]">
          
          {/* 1. CENTER: Burger */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
             <MascotWrapper className="scale-125">
                <BurgerIcon mouseX={mouseX} mouseY={mouseY} isHappy={isHappy} isShy={isShy} />
             </MascotWrapper>
          </div>

          {/* 2. LEFT: The Hungry Packet */}
          <div className="absolute top-1/2 left-[-60px] -translate-y-1/2 z-20">
             <MascotWrapper className="scale-110 z-20">
                <ChipPacketIcon mouseX={mouseX} mouseY={mouseY} isHappy={isHappy} isShy={isShy} isFed={isFed} />
             </MascotWrapper>
          </div>

           {/* 3. RIGHT: The Runaway Chip (Clickable!) */}
           <div className="absolute top-1/2 right-[-80px] -translate-y-1/2 z-40 cursor-pointer" onClick={handleFeed}>
             <RunawayChipIcon isFed={isFed} />
             
             {/* Hint Tooltip (Only visible when chip is actually there) */}
             {!isFed && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#0B0D11] text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap shadow-lg pointer-events-none"
                 >
                    Catch me!
                 </motion.div>
             )}
          </div>

          {/* 4. BACKGROUND SUPPORT */}
          <div className="absolute bottom-[-20px] left-10 z-10">
             <MascotWrapper className="rotate-12 scale-90">
                <SodaIcon mouseX={mouseX} mouseY={mouseY} isHappy={isHappy} isShy={isShy} />
             </MascotWrapper>
          </div>
           <div className="absolute top-[-40px] right-10 z-10">
             <MascotWrapper className="-rotate-6 scale-90">
                <IceCreamIcon mouseX={mouseX} mouseY={mouseY} isHappy={isHappy} isShy={isShy} />
             </MascotWrapper>
          </div>

        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-2 text-slate-600 text-xs font-mono tracking-widest uppercase">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          Status: {isFed ? "🤤 CRUNCHING" : isShy ? "🙈 PRIVACY" : "👀 HUNTING"}
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT SIDE: THE FORM (40%)                */}
      {/* ========================================= */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-24 relative z-20 bg-[#0F1115] border-l border-white/5 shadow-2xl">
        <div className="max-w-sm w-full mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              Pantry<span className="text-orange-500">OS</span>
            </h1>
            <p className="text-slate-500 mb-8 text-sm">
              {isLogin ? "Welcome back! The snacks missed you." : "Join the kitchen today."}
            </p>
          </motion.div>

          {error && (
            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <InputGroup label="Username" type="text" name="username" placeholder="MasterChef" 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                onFocus={() => handleFocus("username")}
                onBlur={handleBlur}
              />
            )}
            <InputGroup label="Email" type="email" name="email" placeholder="chef@pantry.ai" 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onFocus={() => handleFocus("email")} 
              onBlur={handleBlur}
            />
            <InputGroup label="Password" type="password" name="password" placeholder="••••••••" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              onFocus={() => handleFocus("password")} 
              onBlur={handleBlur}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 transition-all ${
                isHappy ? "bg-green-500 hover:bg-green-600 text-white" : "bg-orange-600 hover:bg-orange-500 text-white"
              }`}
            >
              {loading ? "..." : (isHappy ? "Yummy!" : (isLogin ? "Sign In" : "Sign Up"))}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-xs">
            {isLogin ? "No account? " : "Have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-orange-400 hover:text-white font-bold transition-colors">
              {isLogin ? "Create one" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, type, name, placeholder, onChange, onFocus, onBlur }) => (
  <div className="group">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full bg-[#1A1D24] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm focus:border-orange-500 focus:bg-[#20242C] focus:ring-1 focus:ring-orange-500 transition-all outline-none"
      placeholder={placeholder}
      required
    />
  </div>
);

const MascotWrapper = ({ children, className }) => {
  const duration = 3 + Math.random() * 2; 
  return (
  <motion.div
    animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
    transition={{ 
      y: { duration: duration, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut" }
    }}
    className={`hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-2xl ${className}`}
  >
    {children}
  </motion.div>
)};

const useEyeMovement = (mouseX, mouseY, range = 6) => {
  const x = useTransform(mouseX, [0, 1], [-range, range]);
  const y = useTransform(mouseY, [0, 1], [-range, range]);
  return { x, y };
};

// =========================================
// INTERACTIVE CHARACTERS (FIXED)
// =========================================

const ChipPacketIcon = ({ mouseX, mouseY, isHappy, isShy, isFed }) => {
    const pupilsX = useTransform(mouseX, [0, 1], [0, 10]); 
    const pupilsY = useTransform(mouseY, [0, 1], [-2, 6]);
  
    return (
      <motion.svg width="180" height="180" viewBox="0 0 100 120"
        animate={isFed ? { scale: [1, 1.15, 1], rotate: 0 } : { rotate: [10, 15, 10], scaleX: [1, 1.05, 1] }}
        transition={isFed ? { duration: 0.3 } : { duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <path d="M10 20 Q15 10 25 10 H75 Q85 10 90 20 V100 Q85 110 75 110 H25 Q15 110 10 100 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
        <path d="M10 30 H90 M10 90 H90" stroke="#991B1B" strokeWidth="2" fill="none" opacity="0.5" />
        
        <motion.g animate={{ scaleY: isShy ? 0.1 : 1 }} style={{ originY: "50px" }}>
          <circle cx="60" cy="50" r="9" fill="white" />
          <circle cx="80" cy="50" r="9" fill="white" />
          <motion.circle style={{ x: pupilsX, y: pupilsY }} cx="60" cy="50" r="3" fill="#1e293b" />
          <motion.circle style={{ x: pupilsX, y: pupilsY }} cx="80" cy="50" r="3" fill="#1e293b" />
        </motion.g>
        
        {isFed ? (
             <path d="M55 75 Q70 90 85 75" stroke="white" strokeWidth="3" fill="none" />
        ) : (
             <ellipse cx="70" cy="80" rx="10" ry="15" fill="#7f1d1d" stroke="white" strokeWidth="2"/>
        )}
      </motion.svg>
    );
  };

// 👇 FIXED: Explicit scale/opacity restore when !isFed
const RunawayChipIcon = ({ isFed }) => {
    return (
      <motion.svg width="60" height="60" viewBox="0 0 50 50"
        animate={isFed 
            ? { x: -140, y: 10, scale: 0, opacity: 0, rotate: 360 } 
            : { x: [0, 10, 0], y: [0, -20, 0], rotate: [0, 360], scale: 1, opacity: 1 } // <-- Added restore props
        }
        transition={isFed 
            ? { duration: 0.4, ease: "backIn" } 
            : { 
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 0.5 } // Pop back in smoothly
            }
        }
        className="drop-shadow-lg"
      >
         <ellipse cx="25" cy="25" rx="20" ry="14" fill="#FBBF24" stroke="#B45309" strokeWidth="2" transform="rotate(-20 25 25)"/>
         <circle cx="20" cy="22" r="2" fill="#78350F" />
         <circle cx="30" cy="22" r="2" fill="#78350F" />
         <path d="M22 28 Q25 30 28 28" stroke="#78350F" strokeWidth="1" fill="none" />
      </motion.svg>
    );
};

const BurgerIcon = ({ mouseX, mouseY, isHappy, isShy }) => {
  const pupils = useEyeMovement(mouseX, mouseY, 5);
  return (
    <svg width="150" height="150" viewBox="0 0 100 100">
      <path d="M10 50 Q10 20 50 20 Q90 20 90 50" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
      <rect x="10" y="50" width="80" height="10" rx="5" fill="#22C55E" />
      <rect x="10" y="60" width="80" height="15" rx="5" fill="#713F12" />
      <path d="M10 75 h80 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
      <circle cx="35" cy="40" r="8" fill="white" />
      <circle cx="65" cy="40" r="8" fill="white" />
      <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="35" cy="40" r="3" fill="#1e293b" />
      <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="65" cy="40" r="3" fill="#1e293b" />
      <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: isShy ? -15 : 20, opacity: isShy ? 1 : 0 }}>
        <circle cx="30" cy="65" r="12" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
        <circle cx="70" cy="65" r="12" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
      </motion.g>
      {isHappy ? <path d="M30 65 Q50 85 70 65" stroke="#713F12" strokeWidth="3" fill="none" /> : <path d="M40 70 Q50 65 60 70" stroke="#713F12" strokeWidth="3" fill="none" />}
    </svg>
  );
};

const SodaIcon = ({ mouseX, mouseY, isHappy, isShy }) => {
  const pupils = useEyeMovement(mouseX, mouseY, 4);
  return (
    <svg width="110" height="110" viewBox="0 0 100 100">
      <rect x="25" y="20" width="50" height="70" rx="5" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
      <rect x="30" y="15" width="40" height="5" fill="#CBD5E1" />
      <path d="M25 35 h50" stroke="#991B1B" strokeWidth="2" strokeDasharray="4 2" />
      <motion.g animate={{ scaleY: isShy ? 0.1 : 1 }} style={{ originY: "50px" }}>
        <circle cx="40" cy="50" r="7" fill="white" />
        <circle cx="60" cy="50" r="7" fill="white" />
        <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="40" cy="50" r="2.5" fill="#1e293b" />
        <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="60" cy="50" r="2.5" fill="#1e293b" />
      </motion.g>
      {isHappy ? <path d="M35 65 Q50 80 65 65" stroke="white" strokeWidth="3" fill="none" /> : <path d="M45 65 Q50 68 55 65" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />}
    </svg>
  );
};

const IceCreamIcon = ({ mouseX, mouseY, isHappy, isShy }) => {
  const pupils = useEyeMovement(mouseX, mouseY, 4);
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
       <path d="M50 90 L30 50 L70 50 Z" fill="#FDBA74" stroke="#C2410C" strokeWidth="3" />
       <circle cx="50" cy="40" r="22" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
       <motion.g animate={{ scaleY: isShy ? 0.1 : 1 }} style={{ originY: "40px" }}>
        <circle cx="42" cy="40" r="6" fill="white" />
        <circle cx="58" cy="40" r="6" fill="white" />
        <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="42" cy="40" r="2.5" fill="#1e293b" />
        <motion.circle style={{ x: pupils.x, y: pupils.y }} cx="58" cy="40" r="2.5" fill="#1e293b" />
       </motion.g>
       {isHappy ? <path d="M40 55 Q50 65 60 55" stroke="#831843" strokeWidth="3" fill="none" /> : <rect x="35" y="25" width="4" height="2" transform="rotate(45 35 25)" fill="white" />}
    </svg>
  );
};

export default Login;
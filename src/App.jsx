import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login";
import Inventory from "./Inventory";
import Scan from "./Scan";
import Chef from "./Chef";
import ShoppingList from "./ShoppingList";

// Icons (Simple SVGs)
const Icons = {
  Scan: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>,
  Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
  Chef: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
  List: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
};

// Main Component Wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Inner Component (So we can use hooks like useNavigate)
function AppContent() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const location = useLocation(); // Gets current URL (e.g., "/scan")

  const handleLoginSuccess = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  if (!token) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="flex h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* 1. SIDEBAR (The "Pro" Navigation) - Hidden on Mobile */}
      <aside className="w-64 bg-[#0A0A0A]/80 backdrop-blur-xl border-r border-white/5 flex flex-col hidden md:flex z-50">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Pantry<span className="text-blue-500">OS</span>
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 tracking-[0.2em] uppercase font-bold">v2.0 Beta</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarBtn 
            icon={<Icons.Box />} 
            label="My Pantry" 
            isActive={location.pathname === "/inventory"} 
            onClick={() => navigate("/inventory")} 
          />
          <SidebarBtn 
            icon={<Icons.Scan />} 
            label="Scan Item" 
            isActive={location.pathname === "/scan"} 
            onClick={() => navigate("/scan")} 
          />
           <SidebarBtn 
            icon={<Icons.Chef />} 
            label="AI Chef" 
            isActive={location.pathname === "/chef"} 
            onClick={() => navigate("/chef")} 
          />
          <SidebarBtn 
              icon={<Icons.List />} 
              label="Smart List" 
              isActive={location.pathname === "/shopping"} 
              onClick={() => navigate("/shopping")} 
          />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold tracking-wide"
          >
            <Icons.Logout />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative bg-[#050505] scroll-smooth">
        
        {/* Mobile Header (Only shows on small screens) */}
        <div className="md:hidden flex justify-between items-center p-4 bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
          <span className="font-black text-lg tracking-tight">Pantry<span className="text-blue-500">OS</span></span>
          <button onClick={handleLogout} className="text-xs font-bold text-red-500 border border-red-500/20 px-3 py-1.5 rounded-full">LOGOUT</button>
        </div>
        
        {/* ROUTES: This replaces the old "activeTab" logic */}
        <div className="animate-fade-in-up h-full">
            <Routes>
                <Route path="/" element={<Navigate to="/inventory" />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/chef" element={<Chef />} />
                <Route path="/shopping" element={<ShoppingList />}/>
            </Routes>
        </div>

        {/* Mobile Bottom Nav (Fixed to bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-lg border-t border-white/10 flex justify-around p-3 z-50 pb-safe">
            <MobileNavBtn icon={<Icons.Box />} label="Pantry" isActive={location.pathname === "/inventory"} onClick={() => navigate("/inventory")} />
            <MobileNavBtn icon={<Icons.List />} label="List" isActive={location.pathname === "/shopping"} onClick={() => navigate("/shopping")} />
            <MobileNavBtn icon={<Icons.Scan />} label="Scan" isActive={location.pathname === "/scan"} onClick={() => navigate("/scan")} />
            <MobileNavBtn icon={<Icons.Chef />} label="Chef" isActive={location.pathname === "/chef"} onClick={() => navigate("/chef")} />
        </div>

      </main>
    </div>
  );
}

// Helper: Desktop Sidebar Button
const SidebarBtn = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-300 group ${
      isActive 
        ? "bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    <div className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`}>{icon}</div>
    <span className="font-bold text-sm tracking-wide">{label}</span>
    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
  </button>
);

// Helper: Mobile Bottom Button
const MobileNavBtn = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
        <div className={`${isActive ? "text-blue-500" : "text-slate-500"}`}>{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default App;
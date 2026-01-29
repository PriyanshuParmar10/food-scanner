// src/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show Navbar on Login page
  if (location.pathname === "/") return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/inventory" className="text-xl font-black text-white tracking-tighter">
          Pantry<span className="text-blue-500">OS</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/inventory" className={`text-sm font-bold transition-colors ${location.pathname === '/inventory' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>
            My Pantry
          </Link>
          <Link to="/scan" className={`text-sm font-bold transition-colors ${location.pathname === '/scan' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>
            Scan
          </Link>
          <Link to="/chef" className={`text-sm font-bold transition-colors ${location.pathname === '/chef' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>
            AI Chef
          </Link>
          <Link to="/shopping" className={`text-sm font-bold transition-colors ${location.pathname === '/shopping' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>
            List
          </Link>
        </div>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500/10 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
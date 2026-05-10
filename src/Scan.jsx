import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import AlertToast from "./AlertToast"; 

const Scan = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isScanningRef = useRef(true);

  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [status, setStatus] = useState("Hardware Scan Active");
  const [alert, setAlert] = useState({ message: "", tip: "" });

  const [formData, setFormData] = useState({
    name: "", category: "Other", quantity: 1, expiryDate: "", image: ""
  });

  // 🚀 HARDWARE KILL SWITCH: Manually stops all video tracks
  const stopCameraHardware = () => {
    const videoElement = document.querySelector('#reader video');
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop(); // 🛑 Kills the hardware sensor (red light off)
        console.log("Hardware track released");
      });
      videoElement.srcObject = null;
    }
  };

  // 1. Create a function to initialize the scanner
const startScanner = () => {
  setIsScanning(true);
  isScanningRef.current = true;
  setStatus("Hardware Scan Active");

  // Small timeout to ensure the DOM element #reader is visible before rendering
  setTimeout(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 15, 
      qrbox: { width: 280, height: 160 },
      rememberLastUsedCamera: true
    });

    const onScanSuccess = (decodedText) => {
        stopCameraHardware(); 
        scanner.clear();
        setIsScanning(false);
        isScanningRef.current = false;
        handleLookup(decodedText);
    };

    scanner.render(onScanSuccess, (err) => {});
    scannerRef.current = scanner;

    // ⏱️ Re-attach the 20s failsafe
    setTimeout(() => {
        // We use scannerRef here to check if it's still running
        if (scannerRef.current && isScanningRef.current) {
            handleManualStop();
            setAlert({ message: "Timeout", tip: "Try again or enter manually!" });
        }
    }, 20000);
  }, 100); 
};

  // 2. Update your useEffect to use this new function
useEffect(() => {
  startScanner();

  return () => {
    stopCameraHardware();
    if (scannerRef.current) scannerRef.current.clear().catch(e => {});
  };
}, []);

// 3. Update the Reset Button handler
const resetScanner = () => {
  // Clear any old instances first to be safe
  if (scannerRef.current) {
    scannerRef.current.clear().then(() => {
        startScanner();
    }).catch(() => {
        startScanner(); // Start anyway if clear fails
    });
  } else {
    startScanner();
  }
};
  const handleManualStop = async () => {
    stopCameraHardware(); // Force tracks to stop
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        setIsScanning(false);
        isScanningRef.current = false;
        setStatus("Scanner Resting 😴");
      } catch (err) {
        console.log("Cleanup already handled");
      }
    }
  };

  const handleLookup = async (barcode) => {
    setLoading(true);
    setStatus("Syncing with Global Database...");
    try {
        const API_BASE = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${API_BASE}/api/products/lookup/${barcode}`);
        if (res.data.success) {
            const item = res.data.data;
            const rawCat = item.category?.toLowerCase() || "";
            let mappedCat = "Other";
            if (rawCat.includes("snack") || rawCat.includes("biscu")) mappedCat = "Snack";
            if (rawCat.includes("drink") || rawCat.includes("bever")) mappedCat = "Drink";
            
            setFormData({
                name: item.name,
                category: mappedCat,
                quantity: 1,
                image: item.image || "https://cdn-icons-png.flaticon.com/512/2553/2553691.png",
                expiryDate: "" 
            });
            setStatus("Product Found ✅");
        }
    } catch (err) {
        setAlert({ message: "Lookup Failed", tip: "Product not in global database. Enter manually!" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAlert({ 
            message: "Not Logged In", 
            tip: "Please log in to update your pantry! 🔑" 
        });
        setLoading(false);
        return;
      }
      const API_BASE = import.meta.env.VITE_API_URL; 
      await axios.post(`${API_BASE}/api/inventory`, formData, {
        headers: { "auth-token": token }
      });
      setAlert({ message: "Success!", tip: "Item added to your pantry." });
      setTimeout(() => navigate("/inventory"), 1200);
    } catch (err) {
      setAlert({ message: "Save Error", tip: "Something went wrong on the server." });
    } finally { setLoading(false); }
  };

  const handleAISnap = async () => {
    setAlert({ message: "AI Busy", tip: "Gemini is currently taking a coffee break. ☕" });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center z-10">
        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] min-h-[450px] flex flex-col items-center p-6">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6">{status}</h3>
            {/* 📷 The Scanner Box */}
            <div id="reader" className={`w-full rounded-2xl overflow-hidden border border-white/5 ${!isScanning ? 'hidden' : 'block'}`}></div>
            {!isScanning && (
                    <div className="flex flex-col gap-4 w-full px-4 animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={resetScanner}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <span>🔄</span> TRY SCAN AGAIN
                        </button>
                        
                        <button 
                            onClick={handleAISnap}
                            className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 py-4 rounded-2xl font-bold hover:bg-blue-600/40 transition-all flex items-center justify-center gap-2"
                        >
                            <span>✨</span> ASK AI TO IDENTIFY
                        </button>
                        
                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-tighter">
                            Or simply type the details in the form →
                        </p>
                    </div>
                )}        
              </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
          <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Item Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Item Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Nachos Chips" className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-500 outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Category</label>
                    <div className="relative group">
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-4 text-slate-300 outline-none focus:border-blue-500 appearance-none">
                            <option value="Snack">Snack 🍿</option>
                            <option value="Drink">Drink 🥤</option>
                            <option value="Dairy">Dairy 🥛</option>
                            <option value="Other">Other 📦</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Qty</label>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-4 text-center" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Expiry Date</label>
                <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-4 text-slate-300" required />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                {loading ? "PROCESSING..." : "CONFIRM & SAVE →"}
            </button>
          </form>
        </div>
      </div>
      
      <AlertToast message={alert.message} tip={alert.tip} type="scan" onClose={() => setAlert({ message: "", tip: "" })} />

      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr button { background-color: #3b82f6 !important; color: white !important; border-radius: 8px !important; padding: 8px 16px !important; font-weight: bold !important; border: none !important; margin-top: 10px !important; cursor: pointer !important; }
        #reader__dashboard_section_csr a { color: #3b82f6 !important; text-decoration: underline !important; font-size: 12px !important; margin-top: 5px !important; display: block !important; }
        #reader video { border-radius: 1.5rem !important; object-fit: cover !important; }
      `}</style>
    </div>
  );
};

export default Scan;
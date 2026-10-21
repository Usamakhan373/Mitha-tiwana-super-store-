"use client";
import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// --- DYNAMIC & CLEAN CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyD-placeholder-apna-yahan-dalo", // Yara deployment ke baad direct chalega
  authDomain: "://firebaseapp.com",
  projectId: "mitha-tiwana-store",
  storageBucket: "://appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Page() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState(false);
  const [login, setLogin] = useState(false);
  const [pass, setPass] = useState("");
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [loading, setLoading] = useState(true);

  const EASYPAISA_NUMBER = "03247296703";
  const WHATSAPP = "923247296703";

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const s = await getDocs(q);
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Load Error:", err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 600;
        c.height = img.height * (600 / img.width);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        setForm({ ...form, image: c.toDataURL("image/jpeg", 0.6) });
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  };

  const add = async () => {
    try {
      if (!form.name || !form.price || !form.image) return alert("Sab bharo");
      await addDoc(collection(db, "products"), { ...form, createdAt: Date.now() });
      setForm({ name: "", price: "", image: "" });
      alert("Product Uploaded Successfully!");
      load();
    } catch (err) {
      console.error("Add Error:", err.message);
      alert(err.message);
    }
  };

  const del = async (id) => {
    try {
      if (!confirm("Delete?")) return;
      await deleteDoc(doc(db, "products", id));
      load();
    } catch (err) {
      console.error("Delete Error:", err.message);
    }
  };

  const list = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* APP NAVBAR */}
      <header className="bg-green-700 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div>
          <h1 className="font-extrabold text-lg">Mitha Tiwana Super Store</h1>
          <p className="text-[10px] text-green-100">Khushab • Delivery Panel Active</p>
        </div>
        <button 
          onClick={() => setAdmin(true)} 
          className="bg-white text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow hover:bg-green-50"
        >
          Owner Panel
        </button>
      </header>

      {/* COMPACT SEARCH BAR */}
      <div className="p-4 max-w-xl mx-auto">
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="🔍 Kucch bhi dhoondein..." 
          className="w-full border border-gray-200 p-3 rounded-2xl shadow-sm focus:outline-none bg-white"
        />
      </div>

      {/* PRODUCTS DISPLAY GRID */}
      <main className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="text-center my-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
            <p className="text-gray-400 text-xs mt-2">Products load ho rahi hain...</p>
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-gray-400 my-20 text-sm">Koi item nahi mila.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {list.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="bg-gray-50 h-36 w-full flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="object-cover h-full w-full" />
                  ) : (
                    <span className="text-gray-300 text-xs">No Image</span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-800 text-xs line-clamp-2 min-h-[32px]">{p.name}</h3>
                  <p className="text-red-600 font-extrabold text-sm my-1">Rs. {p.price}</p>
                  
                  <div className="mt-auto space-y-1">
                    <a 
                      href={`https://wa.me{WHATSAPP}?text=Salam, me ye buy karna chahta hu: ${encodeURIComponent(p.name)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-center bg-[#25D366] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-green-600"
                    >
                      🟢 WhatsApp Order
                    </a>
                    {login && (
                      <button 
                        onClick={() => del(p.id)} 
                        className="w-full bg-red-50 text-red-600 py-1 rounded-lg text-[10px] font-bold"
                      >
                        Delete Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* POPUP MODAL (ADMIN CONTROL PANEL) */}
      {admin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setAdmin(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ✕
            </button>
            
            {!login ? (
              <div>
                <h2 className="font-black text-xl text-gray-800">Owner Login</h2>
                <p className="text-xs text-gray-400 mt-0.5">Control panel open karne ke liye key enter karein</p>
                <input 
                  type="password" 
                  value={pass} 
                  onChange={e => setPass(e.target.value)} 
                  placeholder="Mitha@123" 
                  className="w-full border p-3 rounded-xl mt-4 focus:outline-none" 
                />
                <button 
                  onClick={() => { if (pass === "Mitha@123") setLogin(true); else alert("Wrong Password"); }} 
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl mt-3 font-bold"
                >
                  Verify Admin Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="font-bold text-lg text-green-700">Add Stock Active</h2>
                  <button onClick={() => setLogin(false)} className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md">Log Out</button>
                </div>
                <input 
                  type="text" 
                  placeholder="Item Name" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Qeemat (e.g. 240)" 
                  value={form.price} 
                  onChange={e => setForm({...form, price: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-sm" 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onImage} 
                  className="w-full p-1 text-xs text-gray-500" 
                />
                {form.image && <img src={form.image} alt="preview" className="h-16 mx-auto rounded shadow mt-1" />}
                <button 
                  onClick={add} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold"
                >
                  Upload Product
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE FOOTERBAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around items-center z-40 shadow-lg">
        <div className="text-center">
          <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">EasyPaisa Account</p>
          <p className="text-xs font-black text-gray-800">{EASYPAISA_NUMBER}</p>
        </div>
        <div className="h-5 w-px bg-gray-200"></div>
        <div className="text-center">
          <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">WhatsApp Call</p>
          <p className="text-xs font-black text-green-700">+{WHATSAPP}</p>
        </div>

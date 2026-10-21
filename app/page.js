"use client";
import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-placeholder-apna-yahan-dalo", 
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
      alert("Uploaded!");
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const del = async (id) => {
    try {
      if (!confirm("Delete?")) return;
      await deleteDoc(doc(db, "products", id));
      load();
    } catch (err) {
      console.error(err.message);
    }
  };

  const list = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Inline basic core styles for backup rendering
  const styles = {
    header: { backgroundColor: "#0a7a2e", color: "white", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    btnOwner: { backgroundColor: "white", color: "#0a7a2e", border: "none", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" },
    searchBox: { width: "90%", maxWidth: "500px", margin: "20px auto", display: "block", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", padding: "15px", maxWidth: "1200px", margin: "0 auto" },
    card: { backgroundColor: "white", border: "1px solid #eee", borderRadius: "15px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
    waBtn: { backgroundColor: "#25D366", color: "white", textDecoration: "none", display: "block", textAlign: "center", padding: "8px", borderRadius: "10px", marginTop: "8px", fontWeight: "bold", fontSize: "12px" },
    modal: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyCenter: "center", padding: "20px" },
    modalContent: { backgroundColor: "white", padding: "20px", borderRadius: "20px", width: "100%", maxWidth: "350px", margin: "auto", position: "relative" },
    input: { width: "100%", border: "1px solid #ccc", padding: "10px", borderRadius: "8px", marginTop: "10px" },
    btnSubmit: { width: "100%", backgroundColor: "#0a7a2e", color: "white", padding: "12px", border: "none", borderRadius: "10px", marginTop: "10px", fontWeight: "bold" },
    footer: { position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderTop: "1px solid #eee", padding: "12px", display: "flex", justifyContent: "space-around", textAlign: "center" }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Mitha Tiwana Super Store</h1>
          <p style={{ margin: 0, fontSize: "10px", opacity: 0.8 }}>Khushab Delivery Active</p>
        </div>
        <button onClick={() => setAdmin(true)} style={styles.btnOwner}>Owner Panel</button>
      </header>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Products search karein..." style={styles.searchBox} />

      <main>
        {loading ? <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>Loading Items...</p> : list.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "40px" }}>Koi item nahi mila.</p>
        ) : (
          <div style={styles.grid}>
            {list.map(p => (
              <div key={p.id} style={styles.card}>
                <img src={p.image} alt={p.name} style={{ h: "120px", width: "100%", objectCover: "cover", borderRadius: "10px", backgroundColor: "#f0f0f0" }} />
                <h3 style={{ fontSize: "12px", margin: "8px 0 4px 0", fontWeight: "bold", color: "#333" }}>{p.name}</h3>
                <p style={{ color: "red", fontWeight: "bold", fontSize: "14px", margin: 0 }}>Rs. {p.price}</p>
                <a href={`https://wa.me{WHATSAPP}?text=Salam,%20mujhe%20ye%20item%20chahiye:%20${encodeURIComponent(p.name)}`} target="_blank" style={styles.waBtn}>🟢 WhatsApp Order</a>
                {login && <button onClick={() => del(p.id)} style={{ width: "100%", background: "#fff5f5", color: "red", border: "none", padding: "4px", borderRadius: "5px", fontSize: "10px", marginTop: "4px", fontWeight: "bold" }}>Delete</button>}
              </div>
            ))}
          </div>
        )}
      </main>

      {admin && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button onClick={() => setAdmin(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", fontSize: "16px", fontWeight: "bold", color: "#aaa" }}>✕</button>
            {!login ? (
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Owner Login</h2>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mitha@123" style={styles.input} />
                <button onClick={() => { if (pass === "Mitha@123") setLogin(true); else alert("Wrong Password"); }} style={styles.btnSubmit}>Verify Admin</button>
              </div>
            ) : (
              <div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#0a7a2e" }}>Add Product Stock</h2>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item Name" style={styles.input} />
                <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" style={styles.input} />
                <input type="file" accept="image/*" onChange={onImage} style={{ marginTop: "10px", fontSize: "12px" }} />
                <button onClick={add} style={{ ...styles.btnSubmit, backgroundColor: "blue" }}>Upload Item</button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <div>
          <p style={{ margin: 0, fontSize: "9px", color: "#aaa" }}>EasyPaisa Account</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>{EASYPAISA_NUMBER}</p>
        </div>
        <div style={{ width: "1px", backgroundColor: "#eee" }}></div>
        <div>
          <p style={{ margin: 0, fontSize: "9px", color: "#aaa" }}>WhatsApp Call</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#0a7a2e" }}>+{WHATSAPP}</p>
        </div>
      </footer>
    </div>
  );
  }
        
                

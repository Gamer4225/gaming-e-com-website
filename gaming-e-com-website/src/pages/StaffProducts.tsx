// StaffProducts.tsx — Products for sub-admin, merchant, seller
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Product { id: number; name: string; brand: string; category: string; price: number; originalPrice: number; discount: number; condition: string; warranty: string; rating: number; stock: number; description: string; image: string; featured: boolean; specs?: Record<string, string> }

const CATS = ["CPU","GPU","RAM","SSD","PC Cabinet","Gaming Laptop","Console","Controller","Monitor","Gaming Keyboard","Gaming Mouse","Gaming Headset","Gaming Chair","Gaming Desk","Handheld Gaming","Tablet"];

interface Props { setCurrentPage: (p: string) => void }

function StaffProducts({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    adminFetch("/api/staff/products?" + params.toString(), token).then(r => r.json()).then(setProducts);
  }, [token, search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await adminFetch(`/api/staff/products/${id}`, token!, { method: "DELETE" });
    showToast(`Deleted: ${name}`); load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/staff/products" : `/api/staff/products/${editing.id}`;
    const res = await adminFetch(url, token!, { method: isNew ? "POST" : "PUT", body: JSON.stringify(editing) });
    if (!res.ok) { alert((await res.json()).error); return; }
    showToast(isNew ? "Added!" : "Updated!"); setEditing(null); setShowAdd(false); load();
  };

  const handleStockChange = async (id: number, stock: number) => {
    await adminFetch(`/api/staff/products/${id}/stock`, token!, { method: "PATCH", body: JSON.stringify({ stock }) });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
    setEditingStock(null); showToast("Stock updated");
  };

  const startAdd = () => { setEditing({
    name: "", brand: user?.brand || "", category: "CPU", price: 999, originalPrice: 999, discount: 0,
    condition: user?.role === "seller" ? "Pre-Owned" : "New", warranty: "1 Year", rating: 4,
    stock: user?.role === "seller" ? 1 : 10, description: "", image: "", featured: false
  }); setShowAdd(true); };

  if (!user || !["sub-admin", "merchant", "seller"].includes(user.role)) return <div className="admin-body"><p>Access denied.</p></div>;

  const renderForm = () => (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setEditing(null); setShowAdd(false); } }}>
      <div className="modal">
        <h2>{editing?.id ? "Edit" : "Add Product"}</h2>
        <form className="form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="field"><label>Name *</label><input value={editing?.name || ""} onChange={e => setEditing({ ...editing!, name: e.target.value })} /></div>
            <div className="field"><label>Brand</label><input value={editing?.brand || ""} onChange={e => setEditing({ ...editing!, brand: e.target.value })} disabled={user.role === "merchant"} /></div>
            <div className="field"><label>Category</label><select value={editing?.category || ""} onChange={e => setEditing({ ...editing!, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Price ₹</label><input type="number" value={editing?.price || ""} onChange={e => setEditing({ ...editing!, price: Number(e.target.value) })} /></div>
            <div className="field"><label>Orig Price</label><input type="number" value={editing?.originalPrice || ""} onChange={e => setEditing({ ...editing!, originalPrice: Number(e.target.value) })} /></div>
            <div className="field"><label>Stock</label><input type="number" min="0" value={editing?.stock || 0} onChange={e => setEditing({ ...editing!, stock: Number(e.target.value) })} /></div>
            <div className="field"><label>Condition</label><input value={editing?.condition || ""} disabled={user.role === "seller"} onChange={e => setEditing({ ...editing!, condition: e.target.value })} /></div>
          </div>
          <div className="field"><label>Image URL *</label><input value={editing?.image || ""} onChange={e => setEditing({ ...editing!, image: e.target.value })} placeholder="https://..." /></div>
          <div className="field"><label>Description *</label><textarea value={editing?.description || ""} onChange={e => setEditing({ ...editing!, description: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-sec" onClick={() => { setEditing(null); setShowAdd(false); }}>Cancel</button>
            <button type="submit" className="btn btn-prim">{editing?.id ? "Save" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-body">
      <h1>My Products</h1>
      <p className="lead">{products.length} products</p>
      <div className="toolbar">
        <div className="search-box"><span className="icon">🔍</span><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-prim" onClick={startAdd}>+ Add</button>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Cat</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={p.stock === 0 ? { opacity: .45 } : {}}>
              <td>{p.id}</td>
              <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
              <td>{p.brand}</td><td>{p.category}</td><td>₹{p.price?.toLocaleString("en-IN")}</td>
              <td>
                {editingStock === p.id ? (
                  <input className="inline" type="number" min="0" defaultValue={p.stock} autoFocus onBlur={e => handleStockChange(p.id, Number(e.target.value))} onKeyDown={e => { if (e.key === "Enter") handleStockChange(p.id, Number((e.target as HTMLInputElement).value)); if (e.key === "Escape") setEditingStock(null); }} />
                ) : <span onClick={() => setEditingStock(p.id)} style={{ cursor: "pointer" }}>{p.stock}{p.stock === 0 ? <span className="badge badge-danger" style={{ marginLeft: 4 }}>OOS</span> : ""}</span>}
              </td>
              <td>
                <button className="btn btn-sm btn-sec" style={{ marginRight: 4 }} onClick={() => setEditing({ ...p })}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
      {(editing || showAdd) && renderForm()}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default StaffProducts;

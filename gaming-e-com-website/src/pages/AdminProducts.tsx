// AdminProducts.tsx — Product management with search, brand filter, export CSV
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Product { id: number; name: string; brand: string; category: string; price: number; originalPrice: number; discount: number; condition: string; warranty: string; rating: number; stock: number; description: string; image: string; featured: boolean; specs?: Record<string, string> }

const CATEGORIES = ["CPU","GPU","RAM","SSD","PC Cabinet","Gaming Laptop","Console","Controller","Monitor","Gaming Keyboard","Gaming Mouse","Gaming Headset","Gaming Chair","Gaming Desk","Handheld Gaming","Tablet"];
const CONDITIONS = ["New","Pre-Owned"];
const WARRANTIES = ["3 Years","5 Years","2 Years","1 Year","6 Months","Lifetime"];

interface Props { setCurrentPage: (p: string) => void; activePage: string }

function AdminProducts({ setCurrentPage, activePage }: Props) {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (brandFilter !== "All") params.set("brand", brandFilter);
    adminFetch("/api/admin/products?" + params.toString(), token).then(r => r.json()).then(setProducts);
    adminFetch("/api/admin/brands", token).then(r => r.json()).then((b: string[]) => setBrands(b));
  }, [token, search, brandFilter]);

  useEffect(() => { load(); }, [load]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await adminFetch(`/api/admin/products/${id}`, token!, { method: "DELETE" });
    showToast(`Deleted: ${name}`); load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
    const res = await adminFetch(url, token!, { method: isNew ? "POST" : "PUT", body: JSON.stringify(editing) });
    if (!res.ok) { alert((await res.json()).error); return; }
    showToast(isNew ? "Product added!" : "Product updated!");
    setEditing(null); setShowAdd(false); load();
  };

  const toggleFeatured = async (id: number) => {
    const res = await adminFetch(`/api/admin/products/${id}/feature`, token!, { method: "PATCH" });
    const d = await res.json();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: d.featured } : p));
  };

  const handleStockChange = async (id: number, stock: number) => {
    await adminFetch(`/api/admin/products/${id}/stock`, token!, { method: "PATCH", body: JSON.stringify({ stock }) });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
    setEditingStock(null); showToast("Stock updated");
  };

  const handleReseed = async () => {
    if (!confirm("DELETE all products and re-import from products.json?")) return;
    const res = await adminFetch("/api/admin/reseed", token!, { method: "POST" });
    const d = await res.json();
    showToast(`Reseeded: ${d.count} products`); setSearch(""); load();
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Brand,Category,Price,Original,Dsc%,Condition,Warranty,Rating,Stock,Featured\n";
    const rows = products.map(p => `${p.id},"${p.name}","${p.brand}","${p.category}",${p.price},${p.originalPrice},${p.discount},"${p.condition}","${p.warranty}",${p.rating},${p.stock},${p.featured ? 1 : 0}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products-export.csv"; a.click();
    URL.revokeObjectURL(url); showToast("CSV downloaded!");
  };

  const startEdit = (p: Product) => setEditing({ ...p });
  const startAdd = () => { setEditing({ name: "", brand: "", category: "CPU", price: 999, originalPrice: 999, discount: 0, condition: "New", warranty: "3 Years", rating: 4, stock: 10, description: "", image: "", featured: false }); setShowAdd(true); };

  const quickStockActions = (id: number, stock: number) => (
    <span style={{ marginLeft: 6 }}>
      <button className="btn btn-sm btn-sec" style={{ marginRight: 3 }} onClick={() => handleStockChange(id, 0)} title="Set to 0">0</button>
      <button className="btn btn-sm btn-sec" onClick={() => handleStockChange(id, stock + 10)} title="Add 10">+10</button>
    </span>
  );

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const renderForm = () => (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setEditing(null); setShowAdd(false); } }}>
      <div className="modal">
        <h2>{editing?.id ? "Edit Product" : "Add Product"}</h2>
        <form className="form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="field"><label>Name *</label><input value={editing?.name || ""} onChange={e => setEditing({ ...editing!, name: e.target.value })} required /></div>
            <div className="field"><label>Brand *</label><input value={editing?.brand || ""} onChange={e => setEditing({ ...editing!, brand: e.target.value })} required /></div>
            <div className="field"><label>Category</label><select value={editing?.category} onChange={e => setEditing({ ...editing!, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Price ₹</label><input type="number" value={editing?.price || ""} onChange={e => setEditing({ ...editing!, price: Number(e.target.value) })} /></div>
            <div className="field"><label>Orig Price</label><input type="number" value={editing?.originalPrice || ""} onChange={e => setEditing({ ...editing!, originalPrice: Number(e.target.value) })} /></div>
            <div className="field"><label>Disc%</label><input type="number" min="0" max="99" value={editing?.discount || 0} onChange={e => setEditing({ ...editing!, discount: Number(e.target.value) })} /></div>
            <div className="field"><label>Stock</label><input type="number" min="0" value={editing?.stock || 0} onChange={e => setEditing({ ...editing!, stock: Number(e.target.value) })} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Condition</label><select value={editing?.condition} onChange={e => setEditing({ ...editing!, condition: e.target.value })}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Warranty</label><select value={editing?.warranty} onChange={e => setEditing({ ...editing!, warranty: e.target.value })}>{WARRANTIES.map(w => <option key={w}>{w}</option>)}</select></div>
            <div className="field"><label>Rating</label><input type="number" step="0.1" min="1" max="5" value={editing?.rating || 4} onChange={e => setEditing({ ...editing!, rating: Number(e.target.value) })} /></div>
          </div>
          <div className="field"><label>Image URL *</label><input value={editing?.image || ""} onChange={e => setEditing({ ...editing!, image: e.target.value })} placeholder="https://..." /></div>
          <div className="field"><label>Description *</label><textarea value={editing?.description || ""} onChange={e => setEditing({ ...editing!, description: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-sec" onClick={() => { setEditing(null); setShowAdd(false); }}>Cancel</button>
            <button type="submit" className="btn btn-prim">{editing?.id ? "Save" : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-body">
      <h1>Products</h1>
      <p className="lead">{products.length} products</p>
      <div className="toolbar">
        <div className="search-box"><span className="icon">🔍</span>
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="select-box">
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="All">All Brands</option>
            {brands.map(b => <option key={b}>{b}</option>)}</select></div>
        <button className="btn btn-prim" onClick={startAdd}>+ Add</button>
        <button className="btn btn-sec btn-sm" onClick={handleExportCSV}>📥 Export CSV</button>
        <button className="btn btn-danger btn-sm" onClick={handleReseed}>↺ Reseed</button>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Cat</th><th>Price</th><th>Stock</th><th>★</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={p.stock === 0 ? { opacity: .45 } : {}}>
              <td>{p.id}</td>
              <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
              <td>{p.brand}</td><td>{p.category}</td>
              <td>₹{p.price.toLocaleString("en-IN")}</td>
              <td>
                {editingStock === p.id ? (
                  <input className="inline" type="number" min="0" defaultValue={p.stock} autoFocus
                    onBlur={e => handleStockChange(p.id, Number(e.target.value))}
                    onKeyDown={e => { if (e.key === "Enter") handleStockChange(p.id, Number((e.target as HTMLInputElement).value)); if (e.key === "Escape") setEditingStock(null); }} />
                ) : (
                  <span onClick={() => setEditingStock(p.id)} style={{ cursor: "pointer" }}>
                    {p.stock}{p.stock > 0 && p.stock <= 3 && <span className="badge badge-warn" style={{ marginLeft: 4 }}>LOW</span>}
                    {p.stock === 0 && <span className="badge badge-danger" style={{ marginLeft: 4 }}>OOS</span>}
                    {quickStockActions(p.id, p.stock)}
                  </span>
                )}
              </td>
              <td><button className={`btn-icon ${p.featured ? "active" : ""}`} onClick={() => toggleFeatured(p.id)}>★</button></td>
              <td>
                <button className="btn btn-sec btn-sm" style={{ marginRight: 4 }} onClick={() => startEdit(p)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Del</button>
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

export default AdminProducts;

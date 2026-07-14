// AdminProducts.tsx — Full product management: add, edit, delete, stock, featured, search
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Product { id: number; name: string; brand: string; category: string; price: number; originalPrice: number; discount: number; condition: string; warranty: string; rating: number; stock: number; description: string; image: string; featured: boolean; specs?: Record<string, string> }

const CATEGORIES = ["CPU","GPU","RAM","SSD","PC Cabinet","Gaming Laptop","Console","Controller","Monitor","Gaming Keyboard","Gaming Mouse","Gaming Headset","Gaming Chair","Gaming Desk","Handheld Gaming","Tablet"];
const CONDITIONS = ["New","Pre-Owned"];
const WARRANTIES = ["3 Years","5 Years","2 Years","1 Year","6 Months","Lifetime"];

interface AdminProductsProps { setCurrentPage: (p: string) => void }

function AdminProducts({ setCurrentPage }: AdminProductsProps) {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const [editingStock, setEditingStock] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    adminFetch(`/api/admin/products${q}`, token)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [token, search]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await adminFetch(`/api/admin/products/${id}`, token, { method: "DELETE" });
    flash(`Deleted: ${name}`);
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await adminFetch(url, token, { method, body: JSON.stringify(editing) });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Save failed"); return; }
    flash(isNew ? "Product added!" : "Product updated!");
    setEditing(null); setShowAdd(false);
    load();
  };

  const toggleFeatured = async (id: number) => {
    const res = await adminFetch(`/api/admin/products/${id}/feature`, token, { method: "PATCH" });
    const data = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: data.featured } : p)));
  };

  const handleStockChange = async (id: number, stock: number) => {
    await adminFetch(`/api/admin/products/${id}/stock`, token, { method: "PATCH", body: JSON.stringify({ stock }) });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
    setEditingStock(null);
    flash("Stock updated");
  };

  const handleReseed = async () => {
    if (!confirm("This will DELETE all products and re-import from products.json. Continue?")) return;
    const res = await adminFetch("/api/admin/reseed", token, { method: "POST" });
    const data = await res.json();
    flash(`Reseeded: ${data.count} products loaded`);
    setSearch(""); load();
  };

  const startEdit = (p: Product) => setEditing({ ...p });
  const startAdd = () => { setEditing({ name: "", brand: "", category: "CPU", price: 999, originalPrice: 999, discount: 0, condition: "New", warranty: "3 Years", rating: 4, stock: 10, description: "", image: "", featured: false }); setShowAdd(true); };

  if (!user || user.role !== "admin") return <div className="admin-page"><p>Access denied.</p></div>;

  const renderForm = () => (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setEditing(null); setShowAdd(false); } }}>
      <div className="admin-modal">
        <h2>{editing?.id ? "Edit Product" : "Add Product"}</h2>
        <form className="admin-form" onSubmit={handleSave}>
          <div className="admin-form-row">
            <div className="admin-field"><label>Name *</label><input value={editing?.name || ""} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} required /></div>
            <div className="admin-field"><label>Brand *</label><input value={editing?.brand || ""} onChange={(e) => setEditing({ ...editing!, brand: e.target.value })} required /></div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field"><label>Category *</label><select value={editing?.category || ""} onChange={(e) => setEditing({ ...editing!, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="admin-field"><label>Price (₹) *</label><input type="number" value={editing?.price || ""} onChange={(e) => setEditing({ ...editing!, price: Number(e.target.value) })} required /></div>
            <div className="admin-field"><label>Original Price</label><input type="number" value={editing?.originalPrice || ""} onChange={(e) => setEditing({ ...editing!, originalPrice: Number(e.target.value) })} /></div>
            <div className="admin-field"><label>Discount (%)</label><input type="number" value={editing?.discount || 0} onChange={(e) => setEditing({ ...editing!, discount: Number(e.target.value) })} /></div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field"><label>Condition *</label><select value={editing?.condition || ""} onChange={(e) => setEditing({ ...editing!, condition: e.target.value })}>{CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="admin-field"><label>Warranty *</label><select value={editing?.warranty || ""} onChange={(e) => setEditing({ ...editing!, warranty: e.target.value })}>{WARRANTIES.map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
            <div className="admin-field"><label>Rating</label><input type="number" step="0.1" min="1" max="5" value={editing?.rating || 4} onChange={(e) => setEditing({ ...editing!, rating: Number(e.target.value) })} /></div>
            <div className="admin-field"><label>Stock</label><input type="number" min="0" value={editing?.stock || 0} onChange={(e) => setEditing({ ...editing!, stock: Number(e.target.value) })} /></div>
          </div>
          <div className="admin-field"><label>Image URL *</label><input value={editing?.image || ""} onChange={(e) => setEditing({ ...editing!, image: e.target.value })} placeholder="https://images.unsplash.com/..." required /></div>
          <div className="admin-field"><label>Description *</label><textarea value={editing?.description || ""} onChange={(e) => setEditing({ ...editing!, description: e.target.value })} required /></div>
          <div className="admin-modal-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => { setEditing(null); setShowAdd(false); }}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary">{editing?.id ? "Save Changes" : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => setCurrentPage("admin-dashboard")}>← Back to Dashboard</button>
      <h1>Product Management</h1>
      <p className="admin-lead">{products.length} products in catalog</p>

      <div className="admin-section-header" style={{ marginBottom: 16 }}>
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="admin-btn admin-btn-primary" onClick={startAdd}>+ Add Product</button>
          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={handleReseed}>↺ Reseed</button>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={p.stock === 0 ? { opacity: .5 } : {}}>
                  <td>{p.id}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toLocaleString("en-IN")}</td>
                  <td>
                    {editingStock === p.id ? (
                      <input className="admin-inline-edit" type="number" min="0" defaultValue={p.stock}
                        onBlur={(e) => handleStockChange(p.id, Number(e.target.value))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleStockChange(p.id, Number((e.target as HTMLInputElement).value)); if (e.key === "Escape") setEditingStock(null); }}
                        autoFocus />
                    ) : (
                      <span onClick={() => setEditingStock(p.id)} style={{ cursor: "pointer" }} title="Click to edit stock">
                        {p.stock}{p.stock <= 3 && p.stock > 0 ? <span className="admin-badge admin-badge-warn" style={{ marginLeft: 4 }}>LOW</span> : ""}{p.stock === 0 ? <span className="admin-badge admin-badge-danger" style={{ marginLeft: 4 }}>OOS</span> : ""}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className={`admin-btn-icon ${p.featured ? "active" : ""}`} onClick={() => toggleFeatured(p.id)} title="Toggle featured">★</button>
                  </td>
                  <td>
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => startEdit(p)} style={{ marginRight: 4 }}>Edit</button>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id, p.name)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || showAdd) && renderForm()}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}

export default AdminProducts;

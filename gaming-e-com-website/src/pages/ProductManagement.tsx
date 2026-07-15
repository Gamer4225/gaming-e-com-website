import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Product { id: number; name: string; brand: string; category: string; price: number; originalPrice: number; discount: number; condition: string; warranty: string; rating: number; stock: number; description: string; image: string; featured: boolean; sellerId?: number }
const CATS = ["CPU","GPU","RAM","SSD","PC Cabinet","Gaming Laptop","Console","Controller","Monitor","Gaming Keyboard","Gaming Mouse","Gaming Headset","Gaming Chair","Gaming Desk","Handheld Gaming","Tablet"];
const CONDS = ["New","Pre-Owned"];
const WARS = ["3 Years","5 Years","2 Years","1 Year","6 Months","Lifetime"];

interface Props { setCurrentPage: (p: string) => void; basePath?: string }

interface Perms { canAdd: boolean; canEdit: boolean; canDelete: boolean; canFeature: boolean; canReseed: boolean; canExport: boolean; canSearch: boolean; label: string; forceCondition?: string; lockedBrand?: string }

function getPermissions(role: string, brand?: string): Perms {
  switch (role) {
    case "admin": return { canAdd:true, canEdit:true, canDelete:true, canFeature:true, canReseed:true, canExport:true, canSearch:true, label:"Products" };
    case "sub-admin": return { canAdd:true, canEdit:true, canDelete:true, canFeature:true, canReseed:false, canExport:true, canSearch:true, label:"Products" };
    case "merchant": return { canAdd:true, canEdit:true, canDelete:true, canFeature:false, canReseed:false, canExport:false, canSearch:true, label:"My Products", lockedBrand:brand };
    case "seller": return { canAdd:true, canEdit:true, canDelete:true, canFeature:false, canReseed:false, canExport:false, canSearch:true, label:"My Listings", forceCondition:"Pre-Owned" };
    default: return { canAdd:false, canEdit:false, canDelete:false, canFeature:false, canReseed:false, canExport:false, canSearch:false, label:"Products" };
  }
}

function ProductManagement({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const perms = getPermissions(user?.role || "", user?.brand);
  const isAdmin = user?.role === "admin" || user?.role === "sub-admin";
  const isStaff = ["sub-admin","merchant","seller"].includes(user?.role || "");

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState(perms.lockedBrand || "All");
  const [stockFilter, setStockFilter] = useState("all");
  const [stats, setStats] = useState<{total:number,totalValue:number,low:number,oos:number} | null>(null);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editStock, setEditStock] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const fetchUrl = isStaff ? "/api/staff/products" : "/api/admin/products";
  const statsUrl = isStaff ? "/api/staff/stats" : "/api/admin/products-stats";
  const brandsUrl = isStaff ? "/api/admin/brands" : "/api/admin/brands";
  const stockUrl = isStaff ? "/api/staff/products" : "/api/admin/products";

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (search) p.set("q", search);
    if (!perms.lockedBrand && brandFilter !== "All") p.set("brand", brandFilter);
    if (stockFilter !== "all") p.set("filter", stockFilter);
    adminFetch(fetchUrl + "?" + p.toString(), token).then(r => r.json()).then(setProducts);
    if (isAdmin) { adminFetch("/api/admin/products-stats", token).then(r => r.json()).then(setStats); adminFetch("/api/admin/brands", token).then(r => r.json()).then(setBrands); }
    else { adminFetch("/api/staff/stats", token).then(r => r.json()).then(d => setStats({total:d.totalProducts,totalValue:0,low:0,oos:d.outOfStock||0})); }
  }, [token, search, brandFilter, stockFilter]);

  useEffect(() => { load(); }, [load]);

  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const updateStock = async (id: number, v: number) => {
    await adminFetch(`${stockUrl}/${id}/stock`, token!, { method: "PATCH", body: JSON.stringify({ stock: v }) });
    load(); st("Stock updated");
  };

  const del = async (id: number, nm: string) => {
    if (!confirm(`Delete "${nm}"?`)) return;
    await adminFetch(`${stockUrl}/${id}`, token!, { method: "DELETE" }); st(`Deleted: ${nm}`); load();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? fetchUrl : `${stockUrl}/${editing.id}`;
    const payload = {...editing};
    if (perms.forceCondition) payload.condition = perms.forceCondition;
    if (perms.lockedBrand) payload.brand = perms.lockedBrand;
    const res = await adminFetch(url, token!, { method: isNew ? "POST" : "PUT", body: JSON.stringify(payload) });
    if (!res.ok) { alert((await res.json()).error); return; }
    st(isNew ? "Added!" : "Updated!"); setEditing(null); setShowAdd(false); load();
  };

  const toggleFeat = async (id: number) => {
    if (!perms.canFeature) return;
    const res = await adminFetch(`/api/admin/products/${id}/feature`, token!, { method: "PATCH" });
    const j = await res.json(); setProducts(prev => prev.map(p => p.id === id ? {...p, featured: j.featured} : p));
  };

  const reseed = async () => {
    if (!confirm("DELETE all and re-import from products.json?")) return;
    const res = await adminFetch("/api/admin/reseed", token!, { method: "POST" });
    const j = await res.json(); st(`Reseeded: ${j.count} products`); setSearch(""); load();
  };

  const exportCSV = () => {
    const hdr = "ID,Name,Brand,Category,Price,Original,Disc%,Condition,Warranty,Rating,Stock,Featured\n";
    const rows = products.map(p => `${p.id},"${p.name}","${p.brand}","${p.category}",${p.price},${p.originalPrice},${p.discount},"${p.condition}","${p.warranty}",${p.rating},${p.stock},${p.featured?1:0}`).join("\n");
    const blob = new Blob([hdr+rows], {type:"text/csv"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="products.csv"; a.click(); URL.revokeObjectURL(url); st("CSV downloaded!");
  };

  const startAdd = () => {
    setEditing({
      name:"", brand: perms.lockedBrand || "", category:"CPU", price:999, originalPrice:999, discount:0,
      condition: perms.forceCondition || "New", warranty:"1 Year", rating:4,
      stock: perms.forceCondition ? 1 : 10, description:"", image:"", featured:false
    }); setShowAdd(true);
  };

  if (!user || !["admin","sub-admin","merchant","seller"].includes(user.role)) return <div className="admin-body"><p>Access denied.</p></div>;

  const form = () => (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setEditing(null); setShowAdd(false); } }}>
      <div className="modal">
        <h2>{editing?.id ? "Edit Product" : "Add Product"}</h2>
        <form className="form" onSubmit={save}>
          <div className="form-row">
            <div className="field"><label>Name *</label><input value={editing?.name||""} onChange={e => setEditing({...editing!, name: e.target.value})} required /></div>
            <div className="field"><label>Brand</label><input value={editing?.brand||""} onChange={e => setEditing({...editing!, brand: e.target.value})} disabled={!!perms.lockedBrand} /></div>
            <div className="field"><label>Category</label><select value={editing?.category} onChange={e => setEditing({...editing!, category: e.target.value})}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Price ₹</label><input type="number" value={editing?.price||""} onChange={e => setEditing({...editing!, price: Number(e.target.value)})} /></div>
            <div className="field"><label>Orig Price</label><input type="number" value={editing?.originalPrice||""} onChange={e => setEditing({...editing!, originalPrice: Number(e.target.value)})} /></div>
            <div className="field"><label>Disc%</label><input type="number" min="0" max="99" value={editing?.discount||0} onChange={e => setEditing({...editing!, discount: Number(e.target.value)})} /></div>
            <div className="field"><label>Stock</label><input type="number" min="0" value={editing?.stock||0} onChange={e => setEditing({...editing!, stock: Number(e.target.value)})} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Condition</label><select value={editing?.condition} onChange={e => setEditing({...editing!, condition: e.target.value})} disabled={!!perms.forceCondition}>{CONDS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Warranty</label><select value={editing?.warranty} onChange={e => setEditing({...editing!, warranty: e.target.value})}>{WARS.map(w => <option key={w}>{w}</option>)}</select></div>
            <div className="field"><label>Rating</label><input type="number" step="0.1" min="1" max="5" value={editing?.rating||4} onChange={e => setEditing({...editing!, rating: Number(e.target.value)})} /></div>
          </div>
          <div className="field"><label>Image URL *</label><input value={editing?.image||""} onChange={e => setEditing({...editing!, image: e.target.value})} placeholder="https://..." /></div>
          <div className="field"><label>Description *</label><textarea value={editing?.description||""} onChange={e => setEditing({...editing!, description: e.target.value})} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setShowAdd(false); }}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing?.id ? "Save" : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-body">
      {isAdmin && (
        <div className="stats-row">
          <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{stats?.total || 0}</div><div className="label">Total Products</div></div></div>
          <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{stats?.totalValue?.toLocaleString("en-IN") || "0"}</div><div className="label">Inventory Value</div></div></div>
          <div className="stat-card"><div className="icon-circle orange">⚠️</div><div className="stat-info"><div className="value">{stats?.low || 0}</div><div className="label">Low Stock (≤5)</div></div></div>
          <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{stats?.oos || 0}</div><div className="label">Out of Stock</div></div></div>
        </div>
      )}
      <div className="toolbar">
        <div className="search-box"><span className="icon">🔍</span><input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        {!perms.lockedBrand && (
          <div className="select-box"><select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}><option value="All">All Brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select></div>
        )}
        <div className="select-box"><select value={stockFilter} onChange={e => setStockFilter(e.target.value)}><option value="all">All Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select></div>
        {perms.canAdd && <button className="btn btn-primary" onClick={startAdd}>+ Add</button>}
        {perms.canExport && <button className="btn btn-secondary btn-sm" onClick={exportCSV}>📥 Export CSV</button>}
        {perms.canReseed && <button className="btn btn-danger btn-sm" onClick={reseed}>↺ Reseed</button>}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Cat</th><th>Price</th><th>Stock</th>{perms.canFeature && <th>★</th>}{(perms.canEdit || perms.canDelete) && <th style={{width:120}}>Actions</th>}</tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={p.stock===0?{opacity:.45}:{}}>
              <td>{p.id}</td>
              <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</td>
              <td>{p.brand}</td><td>{p.category}</td>
              <td style={{fontWeight:600}}>₹{p.price?.toLocaleString("en-IN")}</td>
              <td>
                {perms.canEdit ? (
                  editStock === p.id ? (
                    <input className="inline" type="number" min="0" defaultValue={p.stock} autoFocus onBlur={e => updateStock(p.id, Number(e.target.value))} onKeyDown={e => { if (e.key==="Enter") updateStock(p.id, Number((e.target as HTMLInputElement).value)); if (e.key==="Escape") setEditStock(null); }} />
                  ) : <span onClick={() => setEditStock(p.id)} style={{cursor:"pointer"}}>{p.stock}{p.stock>0&&p.stock<=5?<span className="badge badge-orange" style={{marginLeft:4}}>LOW</span>:""}{p.stock===0?<span className="badge badge-red" style={{marginLeft:4}}>OOS</span>:""}</span>
                ) : <span>{p.stock}{p.stock===0?<span className="badge badge-red" style={{marginLeft:4}}>OOS</span>:""}</span>}
                {perms.canEdit && <span style={{marginLeft:4}}><button className="btn btn-sm btn-sec" style={{padding:"1px 6px",fontSize:".65rem",marginRight:2}} onClick={e => { e.stopPropagation(); updateStock(p.id, Math.max(0, p.stock-1)); }}>-1</button><button className="btn btn-sm btn-sec" style={{padding:"1px 6px",fontSize:".65rem"}} onClick={e => { e.stopPropagation(); updateStock(p.id, p.stock+1); }}>+1</button></span>}
              </td>
              {perms.canFeature && <td><button className={`btn-icon ${p.featured?"active":""}`} onClick={() => toggleFeat(p.id)}>★</button></td>}
              {(perms.canEdit || perms.canDelete) && (
                <td>
                  {perms.canEdit && <button className="btn btn-secondary btn-sm" style={{marginRight:4}} onClick={() => setEditing({...p})}>Edit</button>}
                  {perms.canDelete && <button className="btn btn-danger btn-sm" onClick={() => del(p.id, p.name)}>Del</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table></div></div>
      {(editing || showAdd) && form()}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default ProductManagement;

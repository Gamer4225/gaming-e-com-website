import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminInventory({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (search) p.set("q", search);
    adminFetch("/api/admin/products?" + p.toString(), token).then(r => r.json()).then(setProducts);
  }, [token, search]);
  useEffect(() => { load(); }, [load]);
  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const updateStock = async (id: number, stock: number) => {
    await adminFetch(`/api/admin/products/${id}/stock`, token!, { method: "PATCH", body: JSON.stringify({ stock }) });
    load(); st("Stock updated");
  };

  let display = products;
  if (filter === "low") display = products.filter(p => p.stock > 0 && p.stock <= 5);
  if (filter === "out") display = products.filter(p => p.stock === 0);
  const totalValue = display.reduce((s: number, p: any) => s + p.price * p.stock, 0);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{display.length}</div><div className="label">Products</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{totalValue.toLocaleString("en-IN")}</div><div className="label">Inventory Value</div></div></div>
        <div className="stat-card"><div className="icon-circle orange">⚠️</div><div className="stat-info"><div className="value">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</div><div className="label">Low Stock</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{products.filter(p => p.stock === 0).length}</div><div className="label">Out of Stock</div></div></div>
      </div>
      <div className="toolbar">
        <div className="search-box"><span className="icon">🔍</span><input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="select-box"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Value</th><th>Status</th></tr></thead>
        <tbody>{display.map((p: any) => (
          <tr key={p.id} style={p.stock === 0 ? {opacity:.45} : {}}>
            <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:600}}>{p.name}</td>
            <td>{p.brand}</td><td>{p.category}</td>
            <td style={{fontWeight:600}}>₹{p.price?.toLocaleString("en-IN")}</td>
            <td><strong>{p.stock}</strong>
              <span style={{marginLeft:6}}>
                <button className="btn btn-sm btn-sec" style={{marginRight:3,padding:"2px 6px"}} onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}>-1</button>
                <button className="btn btn-sm btn-sec" style={{padding:"2px 6px"}} onClick={() => updateStock(p.id, p.stock + 1)}>+1</button>
              </span>
            </td>
            <td style={{fontWeight:600}}>₹{(p.price * p.stock)?.toLocaleString("en-IN")}</td>
            <td>{p.stock === 0 ? <span className="badge badge-red">OOS</span> : p.stock <= 5 ? <span className="badge badge-orange">LOW</span> : <span className="badge badge-green">OK</span>}</td>
          </tr>
        ))}</tbody>
      </table></div></div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminInventory;

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function AdminDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [bulkCat, setBulkCat] = useState("");
  const [bulkDisc, setBulkDisc] = useState(10);
  const [bulkMsg, setBulkMsg] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    adminFetch("/api/admin/stats", token).then(r => r.json()).then(setD);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const applyBulk = async () => {
    if (!bulkCat) { setBulkMsg("Select a category"); return; }
    const res = await adminFetch("/api/admin/bulk-discount", token!, { method: "POST", body: JSON.stringify({ category: bulkCat, discount: bulkDisc }) });
    const j = await res.json();
    if (res.ok) { show(`${j.updated} products updated with ${j.discount}% discount`); setBulkMsg(""); load(); }
    else setBulkMsg(j.error);
  };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (!d) return <div className="admin-body"><p>Loading...</p></div>;

  const cats = d.catStats?.map((c: any) => c.category) || [];

  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{d.totalProducts}</div><div className="label">Total Products</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📋</div><div className="stat-info"><div className="value">{d.totalOrders}</div><div className="label">Total Orders</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{(d.totalRevenue/1000).toFixed(1)}K</div><div className="label">Total Revenue</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">👥</div><div className="stat-info"><div className="value">{d.totalUsers}</div><div className="label">Registered Users</div></div></div>
        <div className="stat-card"><div className="icon-circle orange">⚠️</div><div className="stat-info"><div className="value">{d.lowStock}</div><div className="label">Low Stock (≤3)</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{d.outOfStock}</div><div className="label">Out of Stock</div></div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header"><h2>Recent Activity</h2></div>
          <div className="feed">
            {d.recentActivity?.slice(0, 8).map((a: any, i: number) => (
              <div key={i} className="feed-item">
                <span className="feed-time">{new Date(a.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                <span>Order <strong>{a.orderId}</strong> — ₹{a.grandTotal?.toLocaleString("en-IN")}</span>
                <span className={`badge ${a.status==="Delivered"?"badge-green":a.status==="Shipped"?"badge-blue":"badge-orange"}`}>{a.status}</span>
              </div>
            ))}
            {!d.recentActivity?.length && <div className="feed-item" style={{ color: "var(--text-muted)" }}>No activity yet.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Category Breakdown</h2></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Category</th><th>Products</th><th>Out of Stock</th></tr></thead>
            <tbody>{d.catStats?.map((c: any) => (
              <tr key={c.category}><td>{c.category}</td><td>{c.total}</td><td>{c.outOfStock > 0 ? <span className="badge badge-red">{c.outOfStock}</span> : "0"}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2>⚡ Bulk Discount by Category</h2></div>
        <div className="bulk-discount">
          <div className="field"><label>Category</label>
            <select value={bulkCat} onChange={e => setBulkCat(e.target.value)}>
              <option value="">-- Select --</option>
              {cats.map((c: string) => <option key={c}>{c}</option>)}
            </select></div>
          <div className="field"><label>Discount %</label>
            <input type="number" min="0" max="99" value={bulkDisc} onChange={e => setBulkDisc(Number(e.target.value))} /></div>
          <button className="btn btn-primary" onClick={applyBulk}>Apply Discount</button>
        </div>
        {bulkMsg && <div style={{ marginTop: 10, fontSize: ".84rem", fontWeight: 600, color: bulkMsg.includes("updated") ? "var(--success)" : "var(--danger)" }}>{bulkMsg}</div>}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => setCurrentPage("admin-products")}>Manage Products</button>
        <button className="btn btn-secondary" onClick={() => setCurrentPage("admin-orders")}>View Orders</button>
        <button className="btn btn-secondary" onClick={() => setCurrentPage("admin-users")}>View Users</button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminDashboard;

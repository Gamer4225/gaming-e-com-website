// AdminDashboard.tsx — Dashboard with stats, activity, category breakdown, bulk discount
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void; activePage: string }

function AdminDashboard({ setCurrentPage, activePage }: Props) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bulkCat, setBulkCat] = useState("");
  const [bulkDisc, setBulkDisc] = useState(10);
  const [bulkMsg, setBulkMsg] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    adminFetch("/api/admin/stats", token).then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  const handleBulkDiscount = async () => {
    if (!bulkCat) { setBulkMsg("Select a category"); return; }
    const res = await adminFetch("/api/admin/bulk-discount", token!, { method: "POST", body: JSON.stringify({ category: bulkCat, discount: bulkDisc }) });
    const d = await res.json();
    if (res.ok) { showToast(`${d.updated} products in "${d.category}" updated with ${d.discount}% discount`); setBulkMsg(""); load(); }
    else setBulkMsg(d.error);
  };

  const categories = stats?.catStats?.map((c: any) => c.category) || [];

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !stats) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <h1>Dashboard</h1>
      <p className="lead">Welcome, {user.name}. Here's your store at a glance.</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="val">{stats.totalProducts}</div><div className="lbl">Products</div></div>
        <div className="stat-card"><div className="val">{stats.totalOrders}</div><div className="lbl">Orders</div></div>
        <div className="stat-card success"><div className="val">₹{(stats.totalRevenue/1000).toFixed(1)}K</div><div className="lbl">Revenue</div></div>
        <div className="stat-card"><div className="val">{stats.totalUsers}</div><div className="lbl">Users</div></div>
        <div className="stat-card warn"><div className="val">{stats.lowStock}</div><div className="lbl">Low Stock (≤3)</div></div>
        <div className="stat-card danger"><div className="val">{stats.outOfStock}</div><div className="lbl">Out of Stock</div></div>
      </div>

      <div className="card">
        <h2>⚡ Bulk Discount by Category</h2>
        <div className="bulk-discount">
          <div className="field"><label>Category</label>
            <select value={bulkCat} onChange={(e) => setBulkCat(e.target.value)}>
              <option value="">-- Select --</option>
              {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div className="field"><label>Discount %</label>
            <input type="number" min="0" max="99" value={bulkDisc} onChange={(e) => setBulkDisc(Number(e.target.value))} /></div>
          <button className="btn btn-prim" onClick={handleBulkDiscount}>Apply Discount</button>
        </div>
        {bulkMsg && <div style={{ color: bulkMsg.includes("updated") ? "#22c55e" : "#ef4444", fontSize: ".82rem", fontWeight: 600 }}>{bulkMsg}</div>}
      </div>

      <div className="card">
        <div className="card-header"><h2>Recent Activity</h2></div>
        <div className="feed">
          {stats.recentActivity?.map((a: any, i: number) => (
            <div key={i} className="feed-item">
              <span className="feed-time">{new Date(a.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span>Order <strong>{a.orderId}</strong> — ₹{a.grandTotal?.toLocaleString("en-IN")}</span>
              <span className={`badge ${a.status === "Delivered" ? "badge-success" : a.status === "Processing" ? "badge-info" : "badge-warn"}`}>{a.status}</span>
            </div>
          ))}
          {!stats.recentActivity?.length && <div className="feed-item">No activity yet.</div>}
        </div>
      </div>

      <div className="card">
        <h2>Category Breakdown</h2>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Category</th><th>Total</th><th>Out of Stock</th></tr></thead>
          <tbody>{stats.catStats.map((c: any) => (
            <tr key={c.category}><td>{c.category}</td><td>{c.total}</td>
              <td>{c.outOfStock > 0 ? <span className="badge badge-danger">{c.outOfStock}</span> : "0"}</td></tr>))}
          </tbody>
        </table></div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default AdminDashboard;

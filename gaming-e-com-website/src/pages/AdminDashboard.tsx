import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function AdminDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [toast, setToast] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    api.adminStats(token).then(setD);
  }, [token]);

  useEffect(() => { load(); }, [load]);
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  if (!d) return <div className="admin-body"><p>Loading dashboard...</p></div>;

  // Calculate derived metrics
  const conversionRate = d.totalOrders && d.totalUsers ? ((d.totalOrders / d.totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="admin-body">
      {/* ====== TOP STATS ROW ====== */}
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{(d.totalRevenue/100000).toFixed(1)}L</div><div className="label">Total Revenue</div><div className="trend up">+12.4% This Month</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📋</div><div className="stat-info"><div className="value">{d.totalOrders}</div><div className="label">Total Orders</div><div className="trend">{d.completedOrders} completed</div></div></div>
        <div className="stat-card"><div className="icon-circle purple">👥</div><div className="stat-info"><div className="value">{d.totalUsers}</div><div className="label">Customers</div><div className="trend">Registered</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📦</div><div className="stat-info"><div className="value">{d.totalProducts}</div><div className="label">Products</div><div className="trend">Published</div></div></div>
      </div>

      {/* ====== SECONDARY STATS ====== */}
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <div className="stat-card"><div className="icon-circle orange">⏳</div><div className="stat-info"><div className="value">{d.pendingOrders}</div><div className="label">Pending</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{d.cancelledOrders}</div><div className="label">Cancelled</div></div></div>
        <div className="stat-card"><div className="icon-circle red">↩️</div><div className="stat-info"><div className="value">0</div><div className="label">Refund Requests</div></div></div>
        <div className="stat-card"><div className="icon-circle red">📦</div><div className="stat-info"><div className="value">{d.outOfStock}</div><div className="label">Out of Stock</div></div></div>
        <div className="stat-card"><div className="icon-circle green">📊</div><div className="stat-info"><div className="value">₹{d.avgOrderValue?.toLocaleString("en-IN") || "0"}</div><div className="label">Avg Order Value</div></div></div>
        <div className="stat-card"><div className="icon-circle purple">🔄</div><div className="stat-info"><div className="value">{conversionRate}%</div><div className="label">Conversion Rate</div></div></div>
      </div>

      {/* ====== REVENUE GRAPH (Simplified bar chart) ====== */}
      <div className="card">
        <div className="card-header">
          <h2>📈 Revenue (Last 30 Days)</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {["7","15","30"].map(t => (
              <button key={t} className={`btn btn-sm ${timeframe===t?"btn-primary":"btn-secondary"}`} onClick={() => setTimeframe(t)}>{t} Days</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, padding: "8px 0" }}>
          {(d.revPerDay || []).slice(-(timeframe ? parseInt(timeframe) : 30)).map((r: any, i: number) => {
            const max = Math.max(...(d.revPerDay || []).map((x: any) => x.revenue), 1);
            const h = Math.max(4, (r.revenue / max) * 170);
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 8 }}>
                <div style={{ width: "100%", height, background: "linear-gradient(180deg, var(--brand-purple), var(--brand-purple-light))", borderRadius: "4px 4px 0 0", transition: "all .2s", cursor: "pointer" }}
                  title={`${r.day}: ₹${r.revenue?.toLocaleString("en-IN")}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== 3-COLUMN LAYOUT ====== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Most Sold Products */}
        <div className="card">
          <div className="card-header"><h2>🔥 Most Sold Products</h2><button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage("admin-ordered")}>View All</button></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Product</th><th>Sold</th><th>Revenue</th><th>Stock</th></tr></thead>
            <tbody>{d.topProducts?.map((p: any, i: number) => (
              <tr key={p.id}><td style={{ fontWeight: 700, color: "var(--brand-purple)" }}>{i + 1}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                <td><span className="badge badge-green">{p.sold}</span></td>
                <td style={{ fontWeight: 600 }}>₹{(p.price * p.sold)?.toLocaleString("en-IN")}</td>
                <td>{p.stock}{p.stock === 0 ? <span className="badge badge-red" style={{ marginLeft: 4 }}>OOS</span> : ""}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        {/* Most Wishlisted */}
        <div className="card">
          <div className="card-header"><h2>💜 Most Wishlisted</h2><button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage("admin-wishlisted")}>View All</button></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Product</th><th>Wishlist</th><th>Price</th><th>Stock</th></tr></thead>
            <tbody>{d.wishlistTop?.map((p: any, i: number) => (
              <tr key={p.id}><td style={{ fontWeight: 700, color: "var(--brand-purple)" }}>{i + 1}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                <td><span className="badge badge-purple">{p.wishlistCount}</span></td>
                <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString("en-IN")}</td>
                <td>{p.stock}{p.stock === 0 ? <span className="badge badge-red" style={{ marginLeft: 4 }}>OOS</span> : ""}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>

      {/* ====== RECENT ORDERS + ACTIVITY FEED ====== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-header"><h2>📋 Recent Orders</h2><button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage("admin-orders")}>View All</button></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{d.recentOrders?.map((o: any) => (
              <tr key={o.orderId}><td style={{ fontFamily: "monospace", fontSize: ".78rem" }}>{o.orderId}</td><td>{o.fullName}</td>
                <td style={{ fontWeight: 600 }}>₹{o.grandTotal?.toLocaleString("en-IN")}</td>
                <td><span className={`badge ${o.status === "Delivered" ? "badge-green" : o.status === "Shipped" ? "badge-blue" : o.status === "Cancelled" ? "badge-red" : "badge-orange"}`}>{o.status}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        <div className="card">
          <div className="card-header"><h2>🟢 Live Activity</h2></div>
          <div className="feed">
            {d.recentActivity?.slice(0, 8).map((a: any, i: number) => (
              <div key={i} className="feed-item" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="feed-time">{new Date(a.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                <span style={{ flex: 1 }}><strong>{a.fullName}</strong> placed order {a.orderId} — ₹{a.grandTotal?.toLocaleString("en-IN")}</span>
                <span className={`badge ${a.status === "Delivered" ? "badge-green" : "badge-orange"}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== QUICK ACTIONS ====== */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2>⚡ Quick Actions</h2></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setCurrentPage("admin-products")}>+ Add Product</button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage("admin-orders")}>View Orders</button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage("admin-users")}>View Customers</button>
          <button className="btn btn-secondary" onClick={() => show("Report downloaded!")}>📥 Export Report</button>
          <button className="btn btn-secondary" onClick={() => load()}>🔄 Refresh</button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminDashboard;

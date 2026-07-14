// StaffDashboard.tsx — Dashboard for sub-admin, merchant, seller
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function StaffDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    adminFetch("/api/staff/dashboard", token).then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!user || !["sub-admin", "merchant", "seller"].includes(user.role)) return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !stats) return <div className="admin-body"><p>Loading...</p></div>;

  const roleLabel = user.role === "sub-admin" ? "Sub-Admin" : user.role === "merchant" ? `Merchant · ${user.brand || "All Brands"}` : "Seller";

  return (
    <div className="admin-body">
      <h1>{roleLabel} Dashboard</h1>
      <p className="lead">Welcome, {user.name}.</p>
      <div className="stats-grid">
        <div className="stat-card"><div className="val">{stats.totalProducts}</div><div className="lbl">Products</div></div>
        <div className="stat-card success"><div className="val">₹{(stats.totalRevenue / 1000).toFixed(1)}K</div><div className="lbl">Revenue</div></div>
        <div className="stat-card danger"><div className="val">{stats.outOfStock}</div><div className="lbl">Out of Stock</div></div>
      </div>
      <div className="card">
        <h2>Recent Orders</h2>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {stats.recentOrders?.map((o: any) => (
              <tr key={o.orderId}><td style={{ fontFamily: "monospace" }}>{o.orderId}</td><td>₹{o.grandTotal?.toLocaleString()}</td><td><span className={`badge ${o.status === "Delivered" ? "badge-success" : "badge-info"}`}>{o.status}</span></td><td>{new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td></tr>
            ))}
            {!stats.recentOrders?.length && <tr><td colSpan={4}>No orders yet.</td></tr>}
          </tbody>
        </table></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-prim" onClick={() => setCurrentPage("admin-products")}>Manage Products</button>
        <button className="btn btn-sec" onClick={() => setCurrentPage("admin-ordered")}>Most Ordered</button>
      </div>
    </div>
  );
}

export default StaffDashboard;

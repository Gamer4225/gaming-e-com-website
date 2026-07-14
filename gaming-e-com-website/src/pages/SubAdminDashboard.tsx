// SubAdminDashboard.tsx — Dashboard for sub-admin
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function SubAdminDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    adminFetch("/api/sub-admin/dashboard", token).then(r => r.json()).then(setD).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "sub-admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !d) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <h1>Sub-Admin Dashboard</h1>
      <p className="lead">Welcome, {user.name}. Manage products and monitor orders.</p>
      <div className="stats-grid">
        <div className="stat-card"><div className="val">{d.totalProducts}</div><div className="lbl">Products</div></div>
        <div className="stat-card"><div className="val">{d.totalOrders}</div><div className="lbl">Total Orders</div></div>
        <div className="stat-card success"><div className="val">₹{(d.totalRevenue/1000).toFixed(1)}K</div><div className="lbl">Revenue</div></div>
        <div className="stat-card warn"><div className="val">{d.lowStock}</div><div className="lbl">Low Stock (≤3)</div></div>
        <div className="stat-card danger"><div className="val">{d.outOfStock}</div><div className="lbl">Out of Stock</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="resp-stack">
        <div className="card">
          <h2>Top Selling</h2>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Product</th><th>Brand</th><th>Sold</th></tr></thead>
            <tbody>{d.topProducts?.map((p: any, i: number) => (
              <tr key={p.id}><td style={{ fontWeight: 700, color: "var(--admin-accent-light)" }}>{i+1}</td><td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td><td>{p.brand}</td><td><span className="badge badge-success">{p.sold}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="card">
          <h2>Recent Orders</h2>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{d.recentOrders?.map((o: any) => (
              <tr key={o.orderId}><td style={{ fontFamily: "monospace", fontSize: ".75rem" }}>{o.orderId}</td><td>{o.fullName}</td><td>₹{o.grandTotal?.toLocaleString()}</td><td><span className={`badge ${o.status==="Delivered"?"badge-success":o.status==="Shipped"?"badge-info":"badge-warn"}`}>{o.status}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
      <div className="card">
        <h2>Category Overview</h2>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Category</th><th>Total</th><th>Out of Stock</th></tr></thead>
          <tbody>{d.catStats?.map((c: any) => (
            <tr key={c.category}><td>{c.category}</td><td>{c.total}</td><td>{c.oos > 0 ? <span className="badge badge-danger">{c.oos}</span> : "0"}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-prim" onClick={() => setCurrentPage("staff-products")}>Manage Products</button>
        <button className="btn btn-sec" onClick={() => setCurrentPage("admin-orders")}>All Orders</button>
        <button className="btn btn-sec" onClick={() => setCurrentPage("admin-ordered")}>Most Ordered</button>
      </div>
    </div>
  );
}

export default SubAdminDashboard;

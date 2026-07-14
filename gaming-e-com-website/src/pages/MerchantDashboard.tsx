// MerchantDashboard.tsx — Dashboard for merchants
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function MerchantDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    adminFetch("/api/merchant/dashboard", token).then(r => r.json()).then(setD).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "merchant") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !d) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <h1>{d.brand || "Brand"} Dashboard</h1>
      <p className="lead">Welcome, {user.name}. Brand: <strong>{d.brand}</strong></p>
      <div className="stats-grid">
        <div className="stat-card"><div className="val">{d.totalProducts}</div><div className="lbl">Products Listed</div></div>
        <div className="stat-card warn"><div className="val">{d.lowStock}</div><div className="lbl">Low Stock</div></div>
        <div className="stat-card danger"><div className="val">{d.outOfStock}</div><div className="lbl">Out of Stock</div></div>
        <div className="stat-card"><div className="val">{d.unitsSold}</div><div className="lbl">Units Sold</div></div>
        <div className="stat-card success"><div className="val">₹{(d.totalRevenue/1000).toFixed(1)}K</div><div className="lbl">Revenue</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="resp-stack">
        <div className="card">
          <h2>Top Products</h2>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Product</th><th>Sold</th></tr></thead>
            <tbody>{d.topProducts?.map((p: any, i: number) => (
              <tr key={p.id}><td style={{ fontWeight: 700, color: "var(--admin-accent-light)" }}>{i+1}</td><td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td><td><span className="badge badge-success">{p.sold}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="card">
          <h2>Recent Orders</h2>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th></tr></thead>
            <tbody>{d.recentOrders?.map((o: any) => (
              <tr key={o.orderId}><td style={{ fontFamily: "monospace", fontSize: ".75rem" }}>{o.orderId}</td><td>{o.fullName}</td><td>₹{o.grandTotal?.toLocaleString()}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
      <div className="card">
        <h2>Category Breakdown ({d.brand})</h2>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Category</th><th>Products</th><th>Out of Stock</th></tr></thead>
          <tbody>{d.catStats?.map((c: any) => (
            <tr key={c.category}><td>{c.category}</td><td>{c.total}</td><td>{c.oos > 0 ? <span className="badge badge-danger">{c.oos}</span> : "0"}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

export default MerchantDashboard;

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function SellerDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminFetch("/api/seller/dashboard", token).then(r => r.json()).then(setD).finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "seller") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !d) return <div className="admin-body"><p>Loading...</p></div>;

  const activeCount = d.myProducts?.filter((p: any) => p.stock > 0).length || 0;
  const soldCount = d.myProducts?.filter((p: any) => p.stock === 0).length || 0;
  const conversionRate = d.totalListed > 0 ? ((d.soldUnits / d.totalListed) * 100).toFixed(1) : "0";

  return (
    <div className="admin-body">
      <h1>Seller Dashboard</h1>
      <p className="lead">Welcome, {user.name}. Track your pre-owned listings.</p>

      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{d.totalListed}</div><div className="label">Total Listed</div></div></div>
        <div className="stat-card"><div className="icon-circle green">✅</div><div className="stat-info"><div className="value">{activeCount}</div><div className="label">Active</div></div></div>
        <div className="stat-card"><div className="icon-circle red">🏁</div><div className="stat-info"><div className="value">{soldCount}</div><div className="label">Sold</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📊</div><div className="stat-info"><div className="value">{d.soldUnits}</div><div className="label">Units Sold</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{d.earnings?.toLocaleString("en-IN")}</div><div className="label">Earnings</div></div></div>
        <div className="stat-card"><div className="icon-circle purple">🎯</div><div className="stat-info"><div className="value">{conversionRate}%</div><div className="label">Sell Rate</div></div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header"><h2>My Listings</h2></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Product</th><th>Brand</th><th>Price</th><th>Stock</th></tr></thead>
            <tbody>{d.myProducts?.map((p: any) => (
              <tr key={p.id} style={p.stock === 0 ? { opacity: .45 } : {}}>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                <td>{p.brand}</td><td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                <td>{p.stock}{p.stock === 0 ? <span className="badge badge-red" style={{ marginLeft: 4 }}>SOLD</span> : <span className="badge badge-green">ACTIVE</span>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Recent Sales</h2></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Revenue</th></tr></thead>
            <tbody>{d.recentSales?.map((s: any, i: number) => (
              <tr key={i}><td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</td>
                <td style={{ fontWeight: 600 }}>₹{s.price?.toLocaleString()}</td><td>×{s.quantity}</td>
                <td style={{ fontWeight: 600, color: "var(--success)" }}>₹{(s.price * s.quantity)?.toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button className="btn btn-primary" onClick={() => setCurrentPage("staff-products")}>Manage Listings</button>
        <button className="btn btn-secondary" onClick={() => setCurrentPage("products")}>Browse Products</button>
      </div>
    </div>
  );
}
export default SellerDashboard;

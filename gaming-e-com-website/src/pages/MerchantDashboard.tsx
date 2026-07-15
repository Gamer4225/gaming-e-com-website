import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";
interface Props { setCurrentPage: (p: string) => void }

function MerchantDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const load = useCallback(() => { if (!token) return; adminFetch("/api/merchant/dashboard", token).then(r => r.json()).then(setD); }, [token]);
  useEffect(() => { load(); }, [load]);
  if (!user || user.role !== "merchant") return <div className="admin-body"><p>Access denied.</p></div>;
  if (!d) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{d.totalProducts}</div><div className="label">{d.brand} Products</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📦</div><div className="stat-info"><div className="value">{d.unitsSold}</div><div className="label">Units Sold</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{(d.totalRevenue/1000).toFixed(1)}K</div><div className="label">Revenue</div></div></div>
        <div className="stat-card"><div className="icon-circle orange">⚠️</div><div className="stat-info"><div className="value">{d.lowStock}</div><div className="label">Low Stock</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{d.outOfStock}</div><div className="label">Out of Stock</div></div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="card">
          <div className="card-header"><h2>Top Products ({d.brand})</h2></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>#</th><th>Product</th><th>Sold</th></tr></thead>
            <tbody>{d.topProducts?.map((p:any,i:number) => (
              <tr key={p.id}><td style={{fontWeight:700,color:"var(--brand-purple)"}}>{i+1}</td><td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</td><td><span className="badge badge-green">{p.sold}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Recent Orders</h2></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th></tr></thead>
            <tbody>{d.recentOrders?.map((o:any) => (
              <tr key={o.orderId}><td style={{fontFamily:"monospace",fontSize:".75rem"}}>{o.orderId}</td><td>{o.fullName}</td><td style={{fontWeight:600}}>₹{o.grandTotal?.toLocaleString()}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
      <div className="card" style={{marginTop:20}}>
        <div className="card-header"><h2>Category Breakdown ({d.brand})</h2></div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Category</th><th>Products</th><th>Out of Stock</th></tr></thead>
          <tbody>{d.catStats?.map((c:any) => (
            <tr key={c.category}><td>{c.category}</td><td>{c.total}</td><td>{c.oos>0?<span className="badge badge-red">{c.oos}</span>:"0"}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}
export default MerchantDashboard;

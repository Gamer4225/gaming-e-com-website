import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";
interface Props { setCurrentPage: (p: string) => void }

function StaffDashboard({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const load = useCallback(() => { if (!token) return; adminFetch("/api/staff/dashboard", token).then(r => r.json()).then(setD); }, [token]);
  useEffect(() => { load(); }, [load]);
  if (!user || !["sub-admin","merchant","seller"].includes(user.role)) return <div className="admin-body"><p>Access denied.</p></div>;
  if (!d) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{d.totalProducts}</div><div className="label">Products</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{(d.totalRevenue/1000).toFixed(1)}K</div><div className="label">Revenue</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{d.outOfStock}</div><div className="label">Out of Stock</div></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h2>Recent Orders</h2></div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{d.recentOrders?.map((o:any) => (
            <tr key={o.orderId}><td style={{fontFamily:"monospace",fontSize:".8rem"}}>{o.orderId}</td><td style={{fontWeight:600}}>₹{o.grandTotal?.toLocaleString()}</td><td><span className={`badge ${o.status==="Delivered"?"badge-green":"badge-blue"}`}>{o.status}</span></td><td>{new Date(o.placedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}
export default StaffDashboard;

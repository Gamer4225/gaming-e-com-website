// AdminInventory.tsx — Inventory dashboard with reserved/available/incoming
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function AdminInventory({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return; setLoading(true);
    adminFetch("/api/admin/inventory-stats", token).then(r => r.json()).then(setD).finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading || !d) return <div className="admin-body"><p>Loading inventory...</p></div>;

  return (
    <div className="admin-body">
      <h1>Inventory Dashboard</h1>
      <p className="lead">Real-time stock overview across all warehouses</p>

      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{d.totalStock}</div><div className="label">Total Stock</div></div></div>
        <div className="stat-card"><div className="icon-circle green">✅</div><div className="stat-info"><div className="value">{d.totalAvailable}</div><div className="label">Available</div></div></div>
        <div className="stat-card"><div className="icon-circle orange">🔒</div><div className="stat-info"><div className="value">{d.totalReserved}</div><div className="label">Reserved</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">🚚</div><div className="stat-info"><div className="value">{d.totalIncoming}</div><div className="label">Incoming</div></div></div>
        <div className="stat-card"><div className="icon-circle green">📊</div><div className="stat-info"><div className="value">{d.totalSold}</div><div className="label">Total Sold</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{d.totalValue?.toLocaleString("en-IN")}</div><div className="label">Inventory Value</div></div></div>
        <div className="stat-card"><div className="icon-circle orange">⚠️</div><div className="stat-info"><div className="value">{d.lowStock}</div><div className="label">Low Stock</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{d.outOfStock}</div><div className="label">Out of Stock</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Warehouse Breakdown</h2></div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Category</th><th>Products</th><th>Stock</th><th>Reserved</th><th>Incoming</th><th>Available</th></tr></thead>
          <tbody>{d.warehouseBreakdown?.map((c: any) => (
            <tr key={c.category}><td style={{fontWeight:600}}>{c.category}</td><td>{c.products}</td>
              <td>{c.totalStock}</td><td>{c.reserved > 0 ? <span className="badge badge-orange">{c.reserved}</span> : "0"}</td>
              <td>{c.incoming > 0 ? <span className="badge badge-blue">{c.incoming}</span> : "0"}</td>
              <td style={{fontWeight:600}}>{c.totalStock - c.reserved}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
        <button className="btn btn-primary" onClick={() => setCurrentPage("admin-products")}>Manage Products</button>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>
    </div>
  );
}
export default AdminInventory;

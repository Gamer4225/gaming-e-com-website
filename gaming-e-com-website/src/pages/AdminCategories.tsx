import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminCategories({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const load = useCallback(() => { if (!token) return; adminFetch("/api/admin/categories", token).then(r => r.json()).then(setData); }, [token]);
  useEffect(() => { load(); }, [load]);
  
  const totalProducts = data.reduce((s: number, c: any) => s + c.productCount, 0);
  const totalValue = data.reduce((s: number, c: any) => s + (c.inventoryValue || 0), 0);
  const totalOOS = data.reduce((s: number, c: any) => s + (c.oos || 0), 0);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">📦</div><div className="stat-info"><div className="value">{data.length}</div><div className="label">Categories</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📦</div><div className="stat-info"><div className="value">{totalProducts}</div><div className="label">Total Products</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{totalValue.toLocaleString("en-IN")}</div><div className="label">Inventory Value</div></div></div>
        <div className="stat-card"><div className="icon-circle red">❌</div><div className="stat-info"><div className="value">{totalOOS}</div><div className="label">Out of Stock</div></div></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Category</th><th>Products</th><th>Out of Stock</th><th>Inventory Value</th><th>Status</th></tr></thead>
        <tbody>{data.map((c: any) => (
          <tr key={c.name}>
            <td style={{fontWeight:600}}>🏷️ {c.name}</td>
            <td>{c.productCount}</td>
            <td>{c.oos > 0 ? <span className="badge badge-red">{c.oos}</span> : <span className="badge badge-green">0</span>}</td>
            <td style={{fontWeight:600}}>₹{c.inventoryValue?.toLocaleString("en-IN") || "0"}</td>
            <td>{c.oos === c.productCount ? <span className="badge badge-red">All OOS</span> : c.oos > 0 ? <span className="badge badge-orange">Partial</span> : <span className="badge badge-green">Healthy</span>}</td>
          </tr>
        ))}</tbody>
      </table></div>
      </div>
    </div>
  );
}
export default AdminCategories;

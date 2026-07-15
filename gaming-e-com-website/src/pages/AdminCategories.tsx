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
  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  return (
    <div className="admin-body">
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Category</th><th>Products</th><th>Out of Stock</th><th>Inventory Value</th><th>Top Rating</th></tr></thead>
        <tbody>{data.map((c: any) => (
          <tr key={c.name}><td style={{fontWeight:600}}>{c.name}</td><td>{c.productCount}</td>
            <td>{c.oos > 0 ? <span className="badge badge-red">{c.oos}</span> : "0"}</td>
            <td style={{fontWeight:600}}>₹{c.inventoryValue?.toLocaleString("en-IN") || "0"}</td>
            <td>{c.topRating} ★</td></tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
}
export default AdminCategories;

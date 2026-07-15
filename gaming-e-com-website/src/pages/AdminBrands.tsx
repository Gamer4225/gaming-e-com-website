// AdminBrands.tsx — Brand management for admin
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface BrandStat { brand: string; products: number; sold: number; revenue: number; stock: number; oos: number; rating: number }

interface Props { setCurrentPage: (p: string) => void }

function AdminBrands({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [brands, setBrands] = useState<BrandStat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminFetch("/api/admin/brand-stats", token).then(r => r.json()).then(setBrands).finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const totalProducts = brands.reduce((s, b) => s + b.products, 0);
  const totalRevenue = brands.reduce((s, b) => s + b.revenue, 0);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle purple">🏷️</div><div className="stat-info"><div className="value">{brands.length}</div><div className="label">Brands</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📦</div><div className="stat-info"><div className="value">{totalProducts}</div><div className="label">Total Products</div></div></div>
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{totalRevenue.toLocaleString("en-IN")}</div><div className="label">Total Revenue</div></div></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Brand</th><th>Products</th><th>In Stock</th><th>Out of Stock</th><th>Units Sold</th><th>Revenue</th><th>Avg Rating</th></tr></thead>
        <tbody>{brands.map(b => (
          <tr key={b.brand}>
            <td style={{fontWeight:600}}>🏷️ {b.brand}</td>
            <td>{b.products}</td>
            <td>{b.stock}</td>
            <td>{b.oos > 0 ? <span className="badge badge-red">{b.oos}</span> : "0"}</td>
            <td><span className="badge badge-blue">{b.sold}</span></td>
            <td style={{fontWeight:600}}>₹{b.revenue?.toLocaleString("en-IN")}</td>
            <td>{b.rating?.toFixed(1)} ★</td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
}
export default AdminBrands;

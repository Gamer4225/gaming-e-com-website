import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";
interface Props { setCurrentPage: (p: string) => void }

function AdminMostWishlisted({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [sort, setSort] = useState<"asc"|"desc">("desc");
  const load = useCallback(() => { if (!token) return; adminFetch("/api/admin/most-wishlisted", token).then(r => r.json()).then(setData); }, [token]);
  useEffect(() => { load(); }, [load]);
  const sorted = [...data].sort((a,b) => sort==="asc" ? a.wishlistCount - b.wishlistCount : b.wishlistCount - a.wishlistCount);
  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  return (
    <div className="admin-body">
      <div className="toolbar"><div className="select-box"><select value={sort} onChange={e => setSort(e.target.value as "asc"|"desc")}><option value="desc">Most Wishlisted ↓</option><option value="asc">Least Wishlisted ↑</option></select></div></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>#</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Rating</th><th>Wishlist Count</th><th>Stock</th></tr></thead>
        <tbody>{sorted.map((p,i) => (
          <tr key={p.id} style={p.stock===0?{opacity:.45}:{}}>
            <td style={{fontWeight:700,color:"var(--brand-purple)"}}>{i+1}</td>
            <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</td>
            <td>{p.brand}</td><td>{p.category}</td><td style={{fontWeight:600}}>₹{p.price?.toLocaleString("en-IN")}</td>
            <td>{p.rating} ★ {p.featured?<span className="badge badge-purple">Featured</span>:""}</td>
            <td><span className="badge badge-purple">{p.wishlistCount}</span></td>
            <td>{p.stock}{p.stock===0?<span className="badge badge-red" style={{marginLeft:4}}>OOS</span>:""}</td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
}
export default AdminMostWishlisted;

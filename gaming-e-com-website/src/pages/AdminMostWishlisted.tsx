// AdminMostWishlisted.tsx — Most wishlisted products with sort
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface WishlistedProduct { id: number; name: string; brand: string; category: string; price: number; stock: number; image: string; rating: number; featured: boolean; wishlistCount: number }

interface Props { setCurrentPage: (p: string) => void; activePage: string }

function AdminMostWishlisted({ setCurrentPage, activePage }: Props) {
  const { user, token } = useAuth();
  const [data, setData] = useState<WishlistedProduct[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminFetch("/api/admin/most-wishlisted", token).then(r => r.json()).then(d => {
      setData(d || []);
      setLoading(false);
    });
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...data].sort((a, b) => sort === "asc" ? a.wishlistCount - b.wishlistCount : b.wishlistCount - a.wishlistCount);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (loading) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <h1>Most Wishlisted Products</h1>
      <p className="lead">{data.length} products ranked by wishlist popularity</p>
      <div className="toolbar">
        <div className="select-box">
          <select value={sort} onChange={e => setSort(e.target.value as "asc" | "desc")}>
            <option value="desc">Most Wishlisted ↓</option>
            <option value="asc">Least Wishlisted ↑</option>
          </select>
        </div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>#</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Rating</th><th>Wishlist Count</th><th>In Stock</th></tr></thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id} style={p.stock === 0 ? { opacity: .45 } : {}}>
              <td style={{ fontWeight: 700, color: "var(--admin-accent-light)" }}>{i + 1}</td>
              <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>₹{p.price?.toLocaleString("en-IN")}</td>
              <td>{p.rating} ★ {p.featured ? <span className="badge badge-info">Featured</span> : ""}</td>
              <td><span className="badge badge-info">{p.wishlistCount}</span></td>
              <td>{p.stock}{p.stock === 0 && <span className="badge badge-danger" style={{ marginLeft: 4 }}>OOS</span>}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}

export default AdminMostWishlisted;

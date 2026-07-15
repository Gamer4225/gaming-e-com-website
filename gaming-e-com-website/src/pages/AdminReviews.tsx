import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminReviews({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (statusFilter !== "All") p.set("status", statusFilter);
    adminFetch("/api/admin/reviews?" + p.toString(), token).then(r => r.json()).then(setReviews);
  }, [token, statusFilter]);
  useEffect(() => { load(); }, [load]);
  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const updateStatus = async (id: number, status: string) => {
    await adminFetch(`/api/admin/reviews/${id}/status`, token!, { method: "PATCH", body: JSON.stringify({ status }) });
    load(); st(`Review ${status}`);
  };

  const seed = async () => { await adminFetch("/api/admin/reviews/seed", token!, {method:"POST"}); load(); st("Reviews seeded!"); };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="admin-body">
      <div className="toolbar" style={{justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          <div className="select-box"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="hidden">Hidden</option></select></div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={seed}>🌱 Seed Demo Reviews</button>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{reviews.map((r: any) => (
          <tr key={r.id}><td style={{fontWeight:600}}>{r.productName}</td><td>{r.userName}</td>
            <td style={{color:"#f59e0b"}}>{stars(r.rating)}</td>
            <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.comment}</td>
            <td><span className={`badge ${r.status === "approved" ? "badge-green" : r.status === "hidden" ? "badge-red" : "badge-orange"}`}>{r.status}</span></td>
            <td>
              {r.status !== "approved" && <button className="btn btn-sm btn-primary" style={{marginRight:4}} onClick={() => updateStatus(r.id, "approved")}>Approve</button>}
              {r.status !== "hidden" && <button className="btn btn-sm btn-danger" onClick={() => updateStatus(r.id, "hidden")}>Hide</button>}
            </td>
          </tr>
        ))}</tbody>
      </table></div></div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminReviews;

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminCoupons({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", discountValue: 10, discountType: "percentage", minCart: 0, maxUses: "", expiresAt: "" });
  const [toast, setToast] = useState("");

  const load = useCallback(() => { if (!token) return; adminFetch("/api/admin/coupons", token).then(r => r.json()).then(setCoupons); }, [token]);
  useEffect(() => { load(); }, [load]);
  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const create = async () => {
    if (!form.code) { st("Enter a coupon code"); return; }
    const res = await adminFetch("/api/admin/coupons", token!, { method: "POST", body: JSON.stringify({ ...form, maxUses: form.maxUses ? Number(form.maxUses) : null, expiresAt: form.expiresAt || null }) });
    if (res.ok) { st("Coupon created!"); setShowAdd(false); load(); }
    else { const d = await res.json(); st(d.error); }
  };

  const toggleStatus = async (id: number, status: string) => {
    await adminFetch(`/api/admin/coupons/${id}`, token!, { method: "PATCH", body: JSON.stringify({ status }) });
    load(); st(`Coupon ${status === "active" ? "activated" : "paused"}`);
  };

  const del = async (id: number) => { if (confirm("Delete?")) { await adminFetch(`/api/admin/coupons/${id}`, token!, { method: "DELETE" }); load(); st("Deleted"); } };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  return (
    <div className="admin-body">
      <div className="toolbar" style={{justifyContent:"space-between"}}>
        <span className="lead">{coupons.length} coupons</span>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Coupon</button>
      </div>
      {showAdd && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal">
            <h2>New Coupon</h2>
            <div className="form">
              <div className="form-row">
                <div className="field"><label>Code *</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. GAMER20" /></div>
                <div className="field"><label>Discount %</label><input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: Number(e.target.value)})} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Min Cart ₹</label><input type="number" value={form.minCart} onChange={e => setForm({...form, minCart: Number(e.target.value)})} /></div>
                <div className="field"><label>Max Uses</label><input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} placeholder="Leave empty for unlimited" /></div>
                <div className="field"><label>Expires</label><input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={create}>Create Coupon</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Code</th><th>Discount</th><th>Min Cart</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{coupons.map((c: any) => (
          <tr key={c.id}><td style={{fontWeight:700,fontFamily:"monospace"}}>{c.code}</td>
            <td>{c.discountValue}{c.discountType === "percentage" ? "%" : "₹"}</td>
            <td>₹{c.minCart}</td><td>{c.currentUses}{c.maxUses ? `/${c.maxUses}` : ""}</td>
            <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "∞"}</td>
            <td><span className={`badge ${c.status === "active" ? "badge-green" : "badge-red"}`}>{c.status}</span></td>
            <td>
              <button className="btn btn-sm btn-secondary" style={{marginRight:4}} onClick={() => toggleStatus(c.id, c.status === "active" ? "paused" : "active")}>{c.status === "active" ? "Pause" : "Activate"}</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(c.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div></div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminCoupons;

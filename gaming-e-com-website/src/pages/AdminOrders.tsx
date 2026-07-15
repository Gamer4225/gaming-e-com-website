import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
const STS = ["All","Processing","Packaging","Shipping","Delivering","Parceled/Arrived","Cancelled"];
const PL: Record<string,string> = {cod:"COD",upi:"UPI",card:"Card"};

const statusColors: Record<string, string> = {
  "Processing": "badge-orange", "Packaging": "badge-blue", "Shipping": "badge-info",
  "Delivering": "badge-purple", "Parceled/Arrived": "badge-green", "Cancelled": "badge-red",
};

function AdminOrders({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [exp, setExp] = useState<string|null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (statusFilter !== "All") p.set("status", statusFilter);
    adminFetch("/api/admin/orders?"+p.toString(), token).then(r => r.json()).then(setOrders);
  }, [token, statusFilter]);
  useEffect(() => { load(); }, [load]);
  const st = (m:string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const updateStatus = async (oid: string, s: string) => {
    await adminFetch(`/api/admin/orders/${oid}/status`, token!, { method: "PATCH", body: JSON.stringify({ status: s }) });
    setOrders(prev => prev.map(o => o.orderId===oid?{...o, status:s}:o)); st(`Order ${oid}: ${s}`);
  };

  const statusIcon = (s: string) => {
    switch(s) {
      case "Processing": return "⚙️"; case "Packaging": return "📦"; case "Shipping": return "🚚";
      case "Delivering": return "🏃"; case "Parceled/Arrived": return "✅"; case "Cancelled": return "❌";
      default: return "📋";
    }
  };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  return (
    <div className="admin-body">
      <div className="toolbar">
        <div className="select-box"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>{STS.map(s => <option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {orders.map(o => (<>
            <tr key={o.orderId} onClick={() => setExp(exp===o.orderId?null:o.orderId)} style={{cursor:"pointer"}}>
              <td style={{fontFamily:"monospace",fontSize:".8rem"}}>{o.orderId}</td><td>{o.address?.fullName}</td><td>{o.itemCount}</td>
              <td style={{fontWeight:600}}>₹{o.grandTotal?.toLocaleString("en-IN")}</td>
              <td><span className="badge badge-blue">{PL[o.paymentMethod]||o.paymentMethod}</span></td>
              <td onClick={e => e.stopPropagation()}>
                <select className="inline" style={{width:140}} value={o.status} onChange={e => updateStatus(o.orderId, e.target.value)}>
                  {STS.filter(s => s!=="All").map(s => (
                    <option key={s}>{statusIcon(s)} {s}</option>
                  ))}
                </select>
              </td>
              <td>{new Date(o.placedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
            </tr>
            {exp===o.orderId && (
              <tr><td colSpan={7} style={{padding:"14px 18px",background:"var(--admin-bg)"}}>
                <div className="order-timeline" style={{display:"flex",gap:6,alignItems:"center",marginBottom:12,flexWrap:"wrap",fontSize:".78rem",padding:"8px 0"}}>
                  {["Processing","Packaging","Shipping","Delivering","Parceled/Arrived"].map((step, i) => {
                    const currentIdx = STS.indexOf(o.status);
                    const stepIdx = STS.indexOf(step);
                    const done = stepIdx < currentIdx || o.status === step;
                    const active = o.status === step;
                    return (
                      <span key={step} style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{padding:"4px 10px",borderRadius:20,fontWeight:active?800:done?600:400,background:done?"rgba(139,92,246,.12)":"transparent",border:active?"2px solid var(--brand-purple)":"1px solid var(--admin-border)",color:done?"var(--text-primary)":"var(--text-muted)",fontSize:".7rem"}}>{statusIcon(step)} {step}</span>
                        {i < 4 && <span style={{color:"var(--text-muted)"}}>→</span>}
                      </span>
                    );
                  })}
                  {o.status === "Cancelled" && <span className="badge badge-red" style={{fontSize:".75rem"}}>❌ Cancelled</span>}
                </div>
                <div style={{fontSize:".8rem",marginBottom:8}}>📍 {o.address?.fullName} · {o.address?.city}, {o.address?.state} {o.address?.pincode} · 📞 {o.address?.phone}</div>
                <div className="tbl-wrap"><table className="tbl" style={{fontSize:".78rem"}}>
                  <thead><tr><th>Product</th><th>Brand</th><th>Qty</th><th>Price</th></tr></thead>
                  <tbody>{o.items?.map((i:any) => <tr key={i.id}><td>{i.name}</td><td>{i.brand}</td><td>×{i.quantity}</td><td>₹{(i.price*i.quantity).toLocaleString("en-IN")}</td></tr>)}</tbody>
                </table></div>
              </td></tr>
            )}
          </>))}
        </tbody>
      </table></div></div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminOrders;

// AdminOrders.tsx — All orders with status management & filtering
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface OrderItem { id: number; name: string; brand: string; image: string; price: number; quantity: number; condition: string }
interface Order { orderId: string; status: string; paymentMethod: string; grandTotal: number; itemCount: number; placedAt: string; estimatedDelivery: string; address: { fullName: string; city: string; state: string; pincode: string; phone: string; email: string }; items: OrderItem[] }

interface Props { setCurrentPage: (p: string) => void; activePage: string }
const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
const P_LABELS: Record<string, string> = { cod: "COD", upi: "UPI", card: "Card" };

function AdminOrders({ setCurrentPage, activePage }: Props) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    adminFetch("/api/admin/orders?" + params.toString(), token).then(r => r.json()).then(setOrders);
  }, [token, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const updateStatus = async (orderId: string, status: string) => {
    await adminFetch(`/api/admin/orders/${orderId}/status`, token!, { method: "PATCH", body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
    showToast(`Order ${orderId}: ${status}`);
  };

  const statusBadge = (s: string) => {
    const cls = s === "Delivered" ? "badge-success" : s === "Shipped" ? "badge-info" : s === "Cancelled" ? "badge-danger" : "badge-warn";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  return (
    <div className="admin-body">
      <h1>Orders</h1>
      <p className="lead">{orders.length} orders</p>
      <div className="toolbar">
        <div className="select-box">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
        <tbody>
          {orders.map(o => (<>
            <tr key={o.orderId} onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)} style={{ cursor: "pointer" }}>
              <td style={{ fontFamily: "monospace" }}>{o.orderId}</td><td>{o.address.fullName}</td><td>{o.itemCount}</td>
              <td>₹{o.grandTotal.toLocaleString("en-IN")}</td>
              <td><span className="badge badge-info">{P_LABELS[o.paymentMethod] || o.paymentMethod}</span></td>
              <td onClick={e => e.stopPropagation()}>
                <select className="inline" style={{ width: 110 }} value={o.status} onChange={e => updateStatus(o.orderId, e.target.value)}>
                  {STATUSES.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}</select>
              </td>
              <td>{new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
            </tr>
            {expanded === o.orderId && (
              <tr><td colSpan={7} style={{ padding: "12px 16px", background: "var(--admin-bg)" }}>
                <div style={{ fontSize: ".8rem", marginBottom: 6 }}>
                  📍 {o.address.fullName} · {o.address.city}, {o.address.state} {o.address.pincode} · 📞 {o.address.phone}
                  {o.address.email ? ` · ✉ ${o.address.email}` : ""}<br/>
                  🚚 {o.estimatedDelivery} · GST ₹{o.gstAmount?.toLocaleString("en-IN")}
                </div>
                <div className="tbl-wrap"><table className="tbl" style={{ fontSize: ".76rem" }}>
                  <thead><tr><th>Product</th><th>Brand</th><th>Qty</th><th>Price</th></tr></thead>
                  <tbody>{o.items.map(i => <tr key={i.id}><td>{i.name}</td><td>{i.brand}</td><td>×{i.quantity}</td><td>₹{(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>)}</tbody>
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

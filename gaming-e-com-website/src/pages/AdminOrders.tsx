// AdminOrders.tsx — View all orders in a table
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface OrderItem { id: number; name: string; brand: string; image: string; price: number; quantity: number; condition: string }
interface Order { orderId: string; paymentMethod: string; grandTotal: number; itemCount: number; placedAt: string; estimatedDelivery: string; address: { fullName: string; city: string; state: string; pincode: string }; items: OrderItem[] }

interface AdminOrdersProps { setCurrentPage: (p: string) => void }

const payLabels: Record<string, string> = { cod: "COD", upi: "UPI", card: "Card" };

function AdminOrders({ setCurrentPage }: AdminOrdersProps) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminFetch("/api/admin/orders", token)
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  if (!user || user.role !== "admin") return <div className="admin-page"><p>Access denied.</p></div>;
  if (loading) return <div className="admin-page"><p>Loading orders...</p></div>;

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => setCurrentPage("admin-dashboard")}>← Back to Dashboard</button>
      <h1>All Orders</h1>
      <p className="admin-lead">{orders.length} orders total</p>
      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Placed</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.orderId} onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)} style={{ cursor: "pointer" }}>
                    <td style={{ fontFamily: "monospace" }}>{o.orderId}</td>
                    <td>{o.address.fullName}</td>
                    <td>{o.itemCount}</td>
                    <td>₹{o.grandTotal.toLocaleString("en-IN")}</td>
                    <td><span className="admin-badge admin-badge-info">{payLabels[o.paymentMethod] || o.paymentMethod}</span></td>
                    <td>{new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                  {expanded === o.orderId && (
                    <tr key={`${o.orderId}-exp`}>
                      <td colSpan={6} style={{ padding: "12px 16px", background: "var(--bg-tertiary)" }}>
                        <div style={{ fontSize: ".82rem", marginBottom: 8 }}>
                          📍 {o.address.fullName} · {o.address.city}, {o.address.state} {o.address.pincode} · {o.address.phone}{o.address.email ? ` · ${o.address.email}` : ""}<br />
                          🚚 Est. delivery: {o.estimatedDelivery} · GST: ₹{o.gstAmount.toLocaleString("en-IN")} · Savings: ₹{o.totalSavings.toLocaleString("en-IN")}
                        </div>
                        <div className="admin-table-wrap">
                          <table className="admin-table" style={{ fontSize: ".78rem" }}>
                            <thead><tr><th>Product</th><th>Brand</th><th>Qty</th><th>Price</th></tr></thead>
                            <tbody>
                              {o.items.map((i) => (
                                <tr key={i.id}><td>{i.name}</td><td>{i.brand}</td><td>×{i.quantity}</td><td>₹{(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;

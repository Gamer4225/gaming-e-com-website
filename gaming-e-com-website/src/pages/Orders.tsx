// Orders.tsx — Fetches real orders from the server database
import { useState, useEffect } from "react";
import { API_BASE } from "../context/ProductCatalogContext";
import ProductImage from "../components/ProductImage/ProductImage";
import "./StaticPages.css";

function formatPrice(n: number) { return n.toLocaleString("en-IN"); }

const paymentLabels: Record<string, string> = { cod: "Cash on Delivery", upi: "UPI (Demo)", card: "Card (Demo)" };

interface OrdersProps { setCurrentPage: (page: string) => void; setSelectedCategory: (cat: string) => void }

function Orders({ setCurrentPage, setSelectedCategory }: OrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/orders`)
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="static-page"><h1>My Orders</h1><p style={{color:"var(--text-secondary)"}}>Loading orders...</p></div>;

  if (orders.length === 0) {
    return (
      <div className="static-page">
        <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
        <h1>My Orders</h1>
        <div className="static-empty">
          <div className="static-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Orders placed on this device appear here — pulled from the live database.</p>
          <button className="static-btn static-btn-primary" onClick={() => { setSelectedCategory("All"); setCurrentPage("products"); }}>Start Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page static-page-wide">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div>
        <h1>My Orders</h1>
        <p className="static-lead" style={{ marginBottom: 16 }}>{orders.length} order{orders.length > 1 ? "s" : ""} from the database.</p>
      </div>

      {orders.map((order) => {
        const placed = new Date(order.placedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        return (
          <article key={order.orderId} className="order-card">
            <div className="order-card-head">
              <div>
                <div className="order-id">{order.orderId}</div>
                <div className="order-meta">{placed} · {paymentLabels[order.paymentMethod] || order.paymentMethod} · Est. {order.estimatedDelivery}</div>
                <div className="order-meta">{order.status ? `Status: ${order.status}` : ""}</div>
              </div>
              <div className="order-meta">{order.address?.fullName} · {order.address?.city}, {order.address?.pincode}</div>
            </div>
            <div className="order-items-mini">
              {order.items?.map((item: any) => (
                <div key={`${order.orderId}-${item.id}`} className="order-item-mini">
                  <ProductImage src={item.image} alt={item.name} />
                  <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 600 }}>{item.name}</span>
                  <span className="order-meta">×{item.quantity}</span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>₹{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total-row"><span>Grand total (incl. GST)</span><span>₹{formatPrice(order.grandTotal)}</span></div>
          </article>
        );
      })}
    </div>
  );
}

export default Orders;

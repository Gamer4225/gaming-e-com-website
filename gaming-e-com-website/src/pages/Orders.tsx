// Orders.tsx - Local order history (last N orders from localStorage)
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage/ProductImage";
import "./StaticPages.css";

function formatPrice(n: number) {
  return n.toLocaleString("en-IN");
}

const paymentLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI (Demo)",
  card: "Card (Demo)",
};

interface OrdersProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Orders({ setCurrentPage, setSelectedCategory }: OrdersProps) {
  const { orderHistory, clearOrderHistory } = useCart();

  if (orderHistory.length === 0) {
    return (
      <div className="static-page">
        <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
        <h1>My Orders</h1>
        <div className="static-empty">
          <div className="static-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Orders you place on this device will appear here.</p>
          <button
            className="static-btn static-btn-primary"
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage("products");
            }}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page static-page-wide">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1>My Orders</h1>
          <p className="static-lead" style={{ marginBottom: 16 }}>
            {orderHistory.length} order{orderHistory.length > 1 ? "s" : ""} saved on this browser (demo).
          </p>
        </div>
        <button
          className="static-btn static-btn-secondary"
          onClick={() => {
            if (confirm("Clear all local order history on this device?")) clearOrderHistory();
          }}
        >
          Clear history
        </button>
      </div>

      {orderHistory.map((order) => {
        const placed = new Date(order.placedAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <article key={order.orderId} className="order-card">
            <div className="order-card-head">
              <div>
                <div className="order-id">{order.orderId}</div>
                <div className="order-meta">
                  {placed} · {paymentLabels[order.paymentMethod] || order.paymentMethod} · Est. {order.estimatedDelivery}
                </div>
              </div>
              <div className="order-meta">
                {order.address.fullName} · {order.address.city}, {order.address.pincode}
              </div>
            </div>
            <div className="order-items-mini">
              {order.items.map((item) => (
                <div key={`${order.orderId}-${item.id}`} className="order-item-mini">
                  <ProductImage src={item.image} alt={item.name} />
                  <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 600 }}>
                    {item.name}
                  </span>
                  <span className="order-meta">×{item.quantity}</span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    ₹{formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <span>Grand total (incl. GST)</span>
              <span>₹{formatPrice(order.grandTotal)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default Orders;

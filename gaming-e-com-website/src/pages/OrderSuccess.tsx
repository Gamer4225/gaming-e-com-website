// OrderSuccess.tsx - Confirmation screen after placing an order
import { useCart } from "../context/CartContext";
import "./OrderSuccess.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

const paymentLabels = {
  cod: "Cash on Delivery",
  upi: "UPI (Demo)",
  card: "Card (Demo)",
} as const;

interface OrderSuccessProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function OrderSuccess({ setCurrentPage, setSelectedCategory }: OrderSuccessProps) {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return (
      <div className="order-success-page">
        <div className="order-success-empty">
          <div className="order-success-empty-icon">📦</div>
          <h3>No recent order found</h3>
          <p>Place an order from checkout to see confirmation here.</p>
          <button
            className="order-success-btn primary"
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage("products");
            }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const { orderId, items, address, paymentMethod, subtotal, gstAmount, totalSavings, grandTotal, itemCount, estimatedDelivery, placedAt } =
    lastOrder;

  const placedDate = new Date(placedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="order-success-page">
      <div className="order-success-hero">
        <div className="order-success-check">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thanks, {address.fullName.split(" ")[0]} — your gaming gear is on the way.</p>
        <div className="order-success-id">
          Order ID: <strong>{orderId}</strong>
        </div>
        <div className="order-success-meta">
          <span>📅 {placedDate}</span>
          <span>🚚 Est. delivery: <strong>{estimatedDelivery}</strong></span>
        </div>
      </div>

      <div className="order-success-grid">
        <section className="order-success-card">
          <h3>📦 Items Ordered ({itemCount})</h3>
          <div className="order-success-items">
            {items.map((item) => (
              <div key={item.id} className="order-success-item">
                <img src={item.image} alt={item.name} />
                <div className="order-success-item-info">
                  <span className="order-success-item-name">{item.name}</span>
                  <span className="order-success-item-meta">
                    {item.brand} · Qty {item.quantity}
                    {item.condition === "Pre-Owned" ? " · Pre-Owned" : ""}
                  </span>
                </div>
                <span className="order-success-item-price">
                  ₹{formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="order-success-card">
          <h3>📍 Delivery Address</h3>
          <div className="order-success-address">
            <strong>{address.fullName}</strong>
            <span>{address.addressLine1}</span>
            {address.addressLine2 && <span>{address.addressLine2}</span>}
            <span>
              {address.city}, {address.state} — {address.pincode}
            </span>
            <span>📱 {address.phone}</span>
            {address.email && <span>✉️ {address.email}</span>}
          </div>
        </section>

        <section className="order-success-card">
          <h3>💳 Payment & Totals</h3>
          <div className="order-success-totals">
            <div className="order-success-row">
              <span>Payment</span>
              <span>{paymentLabels[paymentMethod]}</span>
            </div>
            <div className="order-success-row">
              <span>Subtotal</span>
              <span>₹{formatPrice(subtotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="order-success-row savings">
                <span>Savings</span>
                <span>-₹{formatPrice(totalSavings)}</span>
              </div>
            )}
            <div className="order-success-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>
            <div className="order-success-row">
              <span>GST (18%)</span>
              <span>₹{formatPrice(gstAmount)}</span>
            </div>
            <div className="order-success-row grand">
              <span>Paid / Payable</span>
              <span>₹{formatPrice(grandTotal)}</span>
            </div>
          </div>
          {paymentMethod === "cod" && (
            <p className="order-success-cod-note">
              Please keep ₹{formatPrice(grandTotal)} ready for Cash on Delivery.
            </p>
          )}
          {paymentMethod !== "cod" && (
            <p className="order-success-demo-note">
              Demo mode: {paymentLabels[paymentMethod]} was simulated — no real charge was made.
            </p>
          )}
        </section>
      </div>

      <div className="order-success-actions">
        <button
          className="order-success-btn primary"
          onClick={() => {
            setSelectedCategory("All");
            setCurrentPage("products");
          }}
        >
          Continue Shopping
        </button>
        <button className="order-success-btn secondary" onClick={() => setCurrentPage("home")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;

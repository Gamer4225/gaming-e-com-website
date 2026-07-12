// Cart.tsx - Shopping cart with GST, delivery, savings; pre-owned aware navigation
import { useCart } from "../../context/CartContext";
import CartItem from "../CartItem/CartItem";
import "./Cart.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function getEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 3 + Math.floor(Math.random() * 3));
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

interface CartProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Cart({ setCurrentPage, setSelectedCategory }: CartProps) {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven&apos;t added anything yet.</p>
          {/* Browse Products → go to Home page (Featured Deals) */}
          <button className="cart-empty-btn btn-ripple" onClick={() => setCurrentPage("home")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const grandTotal = subtotal + gstAmount;
  const deliveryDate = getEstimatedDelivery();

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>🛒 Shopping Cart <span className="cart-header-count">({totalItems} items)</span></h2>
        <button className="cart-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
      </div>

      <div className="cart-delivery-banner">
        🚚 Estimated Delivery: <strong>{deliveryDate}</strong> — Free shipping on all orders!
      </div>

      <div className="cart-items-list">
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <h3 className="cart-summary-title">Order Summary</h3>
        <div className="cart-summary-row"><span>Subtotal ({totalItems} items)</span><span>₹{formatPrice(subtotal)}</span></div>
        {totalSavings > 0 && (
          <div className="cart-summary-row cart-savings-row"><span>💰 Total Savings</span><span className="cart-savings-value">-₹{formatPrice(totalSavings)}</span></div>
        )}
        <div className="cart-summary-row"><span>🚚 Shipping</span><span style={{ color: "#00c853", fontWeight: 600 }}>FREE</span></div>
        <div className="cart-summary-row"><span>📊 GST (18%)</span><span>₹{formatPrice(gstAmount)}</span></div>
        <div className="cart-summary-row total"><span>Grand Total</span><span className="cart-grand-total">₹{formatPrice(grandTotal)}</span></div>

        <div className="cart-summary-actions">
          <button className="cart-checkout-btn btn-ripple">✅ Proceed to Checkout</button>
          {/* Continue Shopping → Products page with ALL categories */}
          <button className="cart-continue-btn" onClick={() => { setSelectedCategory("All"); setCurrentPage("products"); }}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;

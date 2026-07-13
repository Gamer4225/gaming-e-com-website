// Checkout.tsx - Guest checkout: shipping address + payment method + place order
import { useState, type FormEvent } from "react";
import {
  useCart,
  type PaymentMethod,
  type ShippingAddress,
} from "../context/CartContext";
import "./Checkout.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

interface CheckoutProps {
  setCurrentPage: (page: string) => void;
}

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Gujarat",
  pincode: "",
};

function Checkout({ setCurrentPage }: CheckoutProps) {
  const { cartItems, totalItems, totalPrice, placeOrder } = useCart();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <h3>Nothing to checkout</h3>
          <p>Your cart is empty. Add products before placing an order.</p>
          <button className="checkout-empty-btn" onClick={() => setCurrentPage("products")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalSavings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const grandTotal = subtotal + gstAmount;

  const setField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.fullName.trim() || address.fullName.trim().length < 2) {
      next.fullName = "Enter your full name";
    }
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      next.phone = "Enter a valid 10-digit mobile number";
    }
    if (address.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!address.addressLine1.trim() || address.addressLine1.trim().length < 5) {
      next.addressLine1 = "Enter house / street address";
    }
    if (!address.city.trim()) {
      next.city = "Enter city";
    }
    if (!address.state.trim()) {
      next.state = "Select state";
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      next.pincode = "Enter a valid 6-digit PIN code";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const cleaned: ShippingAddress = {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      email: address.email.trim(),
      addressLine1: address.addressLine1.trim(),
      addressLine2: address.addressLine2.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    };
    try {
      const order = await placeOrder(cleaned, paymentMethod);
      if (order) {
        setCurrentPage("order-success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const paymentLabel: Record<PaymentMethod, string> = {
    cod: "Cash on Delivery",
    upi: "UPI (Demo)",
    card: "Card (Demo)",
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="checkout-back" onClick={() => setCurrentPage("cart")}>
          ← Back to Cart
        </button>
        <h2>🧾 Checkout</h2>
        <p className="checkout-sub">Guest checkout — no account needed</p>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-main">
          {/* Shipping */}
          <section className="checkout-card">
            <h3 className="checkout-card-title">📍 Shipping Address</h3>
            <div className="checkout-grid">
              <label className="checkout-field">
                <span>Full Name *</span>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  placeholder="e.g. Dev Mehta"
                  autoComplete="name"
                />
                {errors.fullName && <em className="checkout-error">{errors.fullName}</em>}
              </label>

              <label className="checkout-field">
                <span>Mobile Number *</span>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                  inputMode="numeric"
                />
                {errors.phone && <em className="checkout-error">{errors.phone}</em>}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Email (optional)</span>
                <input
                  type="email"
                  value={address.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="for order updates"
                  autoComplete="email"
                />
                {errors.email && <em className="checkout-error">{errors.email}</em>}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Address Line 1 *</span>
                <input
                  type="text"
                  value={address.addressLine1}
                  onChange={(e) => setField("addressLine1", e.target.value)}
                  placeholder="House no., street, area"
                  autoComplete="address-line1"
                />
                {errors.addressLine1 && <em className="checkout-error">{errors.addressLine1}</em>}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Address Line 2</span>
                <input
                  type="text"
                  value={address.addressLine2}
                  onChange={(e) => setField("addressLine2", e.target.value)}
                  placeholder="Landmark (optional)"
                  autoComplete="address-line2"
                />
              </label>

              <label className="checkout-field">
                <span>City *</span>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="City"
                  autoComplete="address-level2"
                />
                {errors.city && <em className="checkout-error">{errors.city}</em>}
              </label>

              <label className="checkout-field">
                <span>State *</span>
                <select
                  value={address.state}
                  onChange={(e) => setField("state", e.target.value)}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <em className="checkout-error">{errors.state}</em>}
              </label>

              <label className="checkout-field">
                <span>PIN Code *</span>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit PIN"
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
                {errors.pincode && <em className="checkout-error">{errors.pincode}</em>}
              </label>
            </div>
          </section>

          {/* Payment */}
          <section className="checkout-card">
            <h3 className="checkout-card-title">💳 Payment Method</h3>
            <p className="checkout-payment-note">
              Demo checkout only — no real payment is processed.
            </p>
            <div className="checkout-payment-options">
              {(
                [
                  { id: "cod", icon: "💵", title: "Cash on Delivery", desc: "Pay when your order arrives" },
                  { id: "upi", icon: "📱", title: "UPI (Demo)", desc: "GPay / PhonePe / Paytm — simulated" },
                  { id: "card", icon: "💳", title: "Card (Demo)", desc: "Credit / Debit — simulated" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={`checkout-payment-option ${paymentMethod === opt.id ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                  />
                  <span className="checkout-payment-icon">{opt.icon}</span>
                  <span className="checkout-payment-text">
                    <strong>{opt.title}</strong>
                    <small>{opt.desc}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order summary sidebar */}
        <aside className="checkout-summary">
          <h3 className="checkout-card-title">📦 Order Summary</h3>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-meta">
                    Qty {item.quantity} · ₹{formatPrice(item.price)}
                  </span>
                </div>
                <span className="checkout-item-total">
                  ₹{formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{formatPrice(subtotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="checkout-total-row savings">
                <span>Savings</span>
                <span>-₹{formatPrice(totalSavings)}</span>
              </div>
            )}
            <div className="checkout-total-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>
            <div className="checkout-total-row">
              <span>GST (18%)</span>
              <span>₹{formatPrice(gstAmount)}</span>
            </div>
            <div className="checkout-total-row grand">
              <span>Grand Total</span>
              <span>₹{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="checkout-pay-badge">
            Paying via: <strong>{paymentLabel[paymentMethod]}</strong>
          </div>

          <button
            type="submit"
            className="checkout-place-btn btn-ripple"
            disabled={submitting}
          >
            {submitting ? "Placing Order…" : `✅ Place Order · ₹${formatPrice(grandTotal)}`}
          </button>
          <button
            type="button"
            className="checkout-cancel-btn"
            onClick={() => setCurrentPage("cart")}
          >
            ← Return to Cart
          </button>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;

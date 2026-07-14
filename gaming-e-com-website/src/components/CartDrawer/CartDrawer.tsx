// CartDrawer.tsx - Right-side slide-over cart + frequently bought together
import { useEffect, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import { useProductDetail } from "../../context/ProductDetailContext";
import CartItem from "../CartItem/CartItem";
import ProductImage from "../ProductImage/ProductImage";
import { getFrequentlyBoughtTogether } from "../../utils/recommendations";
import "./CartDrawer.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function getEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 3 + Math.floor(Math.random() * 3));
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

interface CartDrawerProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function CartDrawer({ setCurrentPage, setSelectedCategory }: CartDrawerProps) {
  const {
    cartItems,
    totalItems,
    totalPrice,
    clearCart,
    isCartDrawerOpen,
    closeCartDrawer,
    addToCart,
  } = useCart();
  const { products } = useProductCatalog();
  const { user } = useAuth();
  const blocked = ["admin", "sub-admin", "merchant"].includes(user?.role || "");
  const { viewProduct } = useProductDetail();

  const fbt = useMemo(
    () => getFrequentlyBoughtTogether(cartItems, products, 4),
    [cartItems, products]
  );

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCartDrawerOpen]);

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCartDrawerOpen, closeCartDrawer]);

  const subtotal = totalPrice;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalSavings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const grandTotal = subtotal + gstAmount;
  const deliveryDate = getEstimatedDelivery();

  const goCheckout = () => {
    closeCartDrawer();
    setCurrentPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueShopping = () => {
    closeCartDrawer();
    setSelectedCategory("All");
    setCurrentPage("products");
  };

  return (
    <div
      className={`cart-drawer-root ${isCartDrawerOpen ? "open" : ""}`}
      aria-hidden={!isCartDrawerOpen}
    >
      <div
        className="cart-drawer-overlay"
        onClick={closeCartDrawer}
        role="presentation"
      />

      <aside
        className="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <header className="cart-drawer-header">
          <div>
            <h2>🛒 Your Cart</h2>
            <span className="cart-drawer-count">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </span>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeCartDrawer}
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add gaming gear to get started.</p>
            <button type="button" className="cart-drawer-primary-btn" onClick={continueShopping}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-delivery">
              🚚 Est. delivery <strong>{deliveryDate}</strong> · Free shipping
            </div>

            <div className="cart-drawer-items">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              {fbt.length > 0 && (
                <section className="cart-fbt">
                  <h3 className="cart-fbt-title">Frequently bought together</h3>
                  <p className="cart-fbt-sub">
                    Compatible picks from other categories — fewer bottlenecks for your build
                  </p>
                  <div className="cart-fbt-list">
                    {fbt.map((p) => (
                      <div key={p.id} className="cart-fbt-card">
                        <button
                          type="button"
                          className="cart-fbt-main"
                          onClick={() => {
                            viewProduct(p);
                            closeCartDrawer();
                          }}
                        >
                          <ProductImage src={p.image} alt={p.name} />
                          <div className="cart-fbt-info">
                            <span className="cart-fbt-cat">{p.category}</span>
                            <span className="cart-fbt-name">{p.name}</span>
                            <span className="cart-fbt-price">₹{formatPrice(p.price)}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="cart-fbt-add"
                          onClick={() => addToCart(p, 1)}
                          disabled={p.stock <= 0}
                        >
                          {p.stock <= 0 ? "Sold Out" : "+ Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <footer className="cart-drawer-footer">
              {cartItems.length > 0 && (
                <button type="button" className="cart-drawer-clear" onClick={clearCart}>
                  Clear cart
                </button>
              )}
              <div className="cart-drawer-summary">
                <div className="cart-drawer-row">
                  <span>Subtotal</span>
                  <span>₹{formatPrice(subtotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="cart-drawer-row savings">
                    <span>Savings</span>
                    <span>-₹{formatPrice(totalSavings)}</span>
                  </div>
                )}
                <div className="cart-drawer-row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="cart-drawer-row">
                  <span>GST (18%)</span>
                  <span>₹{formatPrice(gstAmount)}</span>
                </div>
                <div className="cart-drawer-row total">
                  <span>Grand Total</span>
                  <span>₹{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {blocked ? (
                <div style={{ padding: "12px", background: "rgba(255,59,48,.08)", border: "1px solid rgba(255,59,48,.25)", borderRadius: "var(--radius-sm)", fontSize: ".85rem", color: "var(--color-danger)", fontWeight: 600, textAlign: "center" }}>
                  🔒 Admin accounts cannot place orders. Please use a customer account.
                </div>
              ) : (
                <button type="button" className="cart-drawer-primary-btn" onClick={goCheckout}>
                  ✅ Proceed to Checkout
                </button>
              )}
              <button type="button" className="cart-drawer-secondary-btn" onClick={continueShopping}>
                ← Continue Shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;

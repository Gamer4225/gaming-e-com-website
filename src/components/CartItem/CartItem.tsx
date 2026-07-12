// CartItem.tsx - Cart row with quantity controls; pre-owned locked at qty 1
import { useCart } from "../../context/CartContext";
import "./CartItem.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function CartItem({ item }: { item: any }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const isPreOwned = item.condition === "Pre-Owned";

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-brand">
          {item.brand} · {item.condition === "Pre-Owned" ? "♻️ Pre-Owned" : "✅ New"}
        </div>
        <div className="cart-item-price">₹{formatPrice(item.price)} each</div>
      </div>

      {/* Quantity controls — disabled + for pre-owned (locked at 1) */}
      <div className="cart-item-quantity">
        <button className="cart-item-qty-btn" onClick={() => decreaseQuantity(item.id)}>−</button>
        <span className="cart-item-qty-value">{item.quantity}</span>
        <button
          className={`cart-item-qty-btn ${isPreOwned ? "qty-disabled" : ""}`}
          onClick={() => increaseQuantity(item.id, isPreOwned)}
          disabled={isPreOwned}
          title={isPreOwned ? "Pre-owned items are unique — quantity locked at 1" : ""}
        >
          +
        </button>
      </div>

      <div className="cart-item-subtotal">
        <div className="cart-item-subtotal-label">Subtotal</div>
        <div className="cart-item-subtotal-price">₹{formatPrice(item.price * item.quantity)}</div>
      </div>

      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
        🗑️ Remove
      </button>
    </div>
  );
}

export default CartItem;

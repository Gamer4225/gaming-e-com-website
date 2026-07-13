// CartItem.tsx - Cart row with quantity controls; pre-owned locked at qty 1; stock-capped for new items
import { useCart } from "../../context/CartContext";
import ProductImage from "../ProductImage/ProductImage";
import "./CartItem.css";

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function CartItem({ item }: { item: any }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart, getRemainingToAdd } = useCart();
  const isPreOwned = item.condition === "Pre-Owned";
  // Remaining units that can still be added beyond current cart qty
  const remaining = getRemainingToAdd(item);
  const atStockLimit = isPreOwned || remaining <= 0;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <ProductImage src={item.image} alt={item.name} />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-brand">
          {item.brand} · {item.condition === "Pre-Owned" ? "♻️ Pre-Owned" : "✅ New"}
        </div>
        <div className="cart-item-price">₹{formatPrice(item.price)} each</div>
      </div>

      {/* Quantity controls — disabled + for pre-owned or when stock is exhausted */}
      <div className="cart-item-quantity">
        <button className="cart-item-qty-btn" onClick={() => decreaseQuantity(item.id)}>−</button>
        <span className="cart-item-qty-value">{item.quantity}</span>
        <button
          className={`cart-item-qty-btn ${atStockLimit ? "qty-disabled" : ""}`}
          onClick={() => increaseQuantity(item.id, isPreOwned)}
          disabled={atStockLimit}
          title={
            isPreOwned
              ? "Pre-owned items are unique — quantity locked at 1"
              : atStockLimit
              ? `Only ${item.stock} unit${item.stock > 1 ? "s" : ""} in stock`
              : undefined
          }
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

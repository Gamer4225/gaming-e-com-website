// ProductCard.tsx - Product card with +/- quantity picker, wishlist, image fallback
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProductDetail, type Product } from "../../context/ProductDetailContext";
import { useAuth } from "../../context/AuthContext";
import ProductImage from "../ProductImage/ProductImage";
import "./ProductCard.css";

function renderStars(rating: number) {
  const stars = [];
  const full = Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    stars.push(<span key={i} className={i < full ? "star-filled" : "star-empty"}>★</span>);
  }
  return stars;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, getRemainingToAdd, isSoldOut } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { viewProduct } = useProductDetail();
  // Local quantity state for the +/- picker on the card
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [qty, setQty] = useState(1);
  const wished = isInWishlist(product.id);

  const isPreOwned = product.condition === "Pre-Owned";
  // Sold out only when inventory stock is 0 (after payment), NOT when cart holds remaining units
  const soldOut = isSoldOut(product);
  const remainingToAdd = getRemainingToAdd(product);
  const cartFull = !soldOut && remainingToAdd <= 0;
  // Low-stock badge only for NEW multi-unit inventory — never for unique pre-owned
  const isLow = !soldOut && !isPreOwned && product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.discount > 0;
  const savings = product.originalPrice - product.price;
  const maxSelectable = soldOut ? 1 : Math.max(1, remainingToAdd);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!soldOut && remainingToAdd > 0) {
      addToCart(product, Math.min(qty, remainingToAdd));
      setQty(1);
    }
  };

  return (
    <div className="pcard" onClick={() => viewProduct(product)}>
      {/* Image */}
      <div className="pcard-img-wrap">
        <ProductImage src={product.image} alt={product.name} />
        <button
          type="button"
          className={`pcard-wish ${wished ? "active" : ""}`}
          title={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wished ? "♥" : "♡"}
        </button>
        <div className="pcard-badges">
          {product.condition === "New" && !soldOut && (
            <span className="pcard-badge pcard-badge-new">NEW</span>
          )}
          {isPreOwned && !soldOut && (
            <span className="pcard-badge pcard-badge-used">PRE-OWNED</span>
          )}
          {soldOut && (
            <span className="pcard-badge pcard-badge-sold">SOLD</span>
          )}
          {!soldOut && isLow && (
            <span className="pcard-badge pcard-badge-low">ONLY {product.stock} LEFT</span>
          )}
        </div>
        {hasDiscount && <div className="pcard-discount-tag">-{product.discount}%</div>}
      </div>

      {/* Body */}
      <div className="pcard-body">
        <div className="pcard-brand-row">
          <span className="pcard-brand">{product.brand}</span>
          <span className="pcard-cat">{product.category}</span>
        </div>
        <h3 className="pcard-name">{product.name}</h3>

        <div className="pcard-rating">
          <div className="pcard-stars">{renderStars(product.rating)}</div>
          <span className="pcard-rating-num">{product.rating}</span>
        </div>

        <div className="pcard-tags">
          <span className="pcard-tag">🛡️ {product.warranty}</span>
          <span className="pcard-tag pcard-tag-free">🚚 Free Shipping</span>
          {!soldOut && product.condition === "New" && (
            <span className="pcard-tag pcard-tag-instock">✅ In Stock</span>
          )}
        </div>

        <div className="pcard-stock">
          <span className={`stock-dot ${soldOut ? "out" : isLow ? "low" : "in"}`}></span>
          <span>
            {soldOut
              ? (isPreOwned ? "Sold" : "Sold Out")
              : cartFull
              ? "Max in cart"
              : isPreOwned
              ? "1 available"
              : isLow
              ? `Only ${product.stock} left`
              : "In Stock"}
          </span>
        </div>
      </div>

      {/* Footer: Price + Qty Picker + Add to Cart */}
      <div className="pcard-foot">
        <div className="pcard-price-col">
          <span className="pcard-price">₹{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="pcard-original">₹{formatPrice(product.originalPrice)}</span>
          )}
          {hasDiscount && <span className="pcard-save">Save ₹{formatPrice(savings)}</span>}
        </div>

        {/* Footer actions: hide add-to-cart for admin; show qty picker + add for customers */}
        {isAdmin ? (
          <div className="pcard-actions pcard-actions-sold">
            <button className="pcard-add-btn btn-ripple disabled" disabled>🔒 Admin View</button>
          </div>
        ) : (
        <div className={`pcard-actions ${soldOut || isPreOwned || cartFull ? "pcard-actions-sold" : ""}`}>
          {!soldOut && !isPreOwned && !cartFull && (
            <div className="pcard-qty-picker">
              <button
                className="pcard-qty-btn"
                onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
              >−</button>
              <span className="pcard-qty-val">{Math.min(qty, maxSelectable)}</span>
              <button
                className="pcard-qty-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setQty((q) => Math.min(maxSelectable, q + 1));
                }}
                disabled={qty >= maxSelectable}
                title={qty >= maxSelectable ? `Only ${maxSelectable} available` : undefined}
              >+</button>
            </div>
          )}
          <button
            className={`pcard-add-btn btn-ripple ${soldOut || cartFull ? "disabled" : ""}`}
            onClick={handleAdd}
            disabled={soldOut || cartFull}
          >
            {soldOut ? (isPreOwned ? "🔴 Sold" : "🔴 Sold Out") : cartFull ? "✓ In Cart" : "🛒 Add"}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;

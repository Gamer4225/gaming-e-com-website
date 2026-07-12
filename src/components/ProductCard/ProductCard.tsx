// ProductCard.tsx - Product card with +/- quantity picker, In Stock / SOLD badges
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useProductDetail, type Product } from "../../context/ProductDetailContext";
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
  const { addToCart, soldPreOwnedIds } = useCart();
  const { viewProduct } = useProductDetail();
  // Local quantity state for the +/- picker on the card
  const [qty, setQty] = useState(1);

  const isPreOwned = product.condition === "Pre-Owned";
  const isSold = isPreOwned
    ? soldPreOwnedIds.includes(product.id) || product.stock === 0
    : product.stock === 0;
  const isLow = !isPreOwned && product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.discount > 0;
  const savings = product.originalPrice - product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSold) {
      addToCart(product, qty);
      setQty(1); // reset after adding
    }
  };

  return (
    <div className="pcard" onClick={() => viewProduct(product)}>
      {/* Image */}
      <div className="pcard-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="pcard-badges">
          {product.condition === "New" && !isSold && (
            <span className="pcard-badge pcard-badge-new">NEW</span>
          )}
          {isPreOwned && !isSold && (
            <span className="pcard-badge pcard-badge-used">PRE-OWNED</span>
          )}
          {isSold && (
            <span className="pcard-badge pcard-badge-sold">SOLD</span>
          )}
          {!isSold && isLow && (
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
          {!isSold && product.condition === "New" && (
            <span className="pcard-tag pcard-tag-instock">✅ In Stock</span>
          )}
        </div>

        <div className="pcard-stock">
          <span className={`stock-dot ${isSold ? "out" : isLow ? "low" : "in"}`}></span>
          <span>
            {isSold
              ? (isPreOwned ? "Sold" : "Sold Out")
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

        {/* +/− Quantity Picker + Add button */}
        <div className="pcard-actions">
          <div className="pcard-qty-picker">
            <button
              className="pcard-qty-btn"
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
              disabled={isSold}
            >−</button>
            <span className="pcard-qty-val">{qty}</span>
            <button
              className="pcard-qty-btn"
              onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1); }}
              disabled={isSold}
            >+</button>
          </div>
          <button
            className={`pcard-add-btn btn-ripple ${isSold ? "disabled" : ""}`}
            onClick={handleAdd}
            disabled={isSold}
          >
            {isSold ? (isPreOwned ? "🔴 Sold" : "🔴 Sold Out") : "🛒 Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

// ProductDetail.tsx - Full product detail + specs + related + buy now + wishlist
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProductDetail, type Product } from "../../context/ProductDetailContext";
import ProductImage from "../ProductImage/ProductImage";
import ProductCard from "../ProductCard/ProductCard";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import "./ProductDetail.css";

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else if (i === fullStars && hasHalf) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else {
      stars.push(<span key={i} className="star-empty">★</span>);
    }
  }
  return stars;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function ProductDetail({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { selectedProduct, clearSelection } = useProductDetail();
  const { addToCart, getRemainingToAdd, isSoldOut } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { products: allProducts } = useProductCatalog();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [qty, setQty] = useState(1);

  const related = useMemo(() => {
    if (!selectedProduct) return [] as Product[];
    return (allProducts as Product[])
      .filter(
        (p) =>
          p.category === selectedProduct.category &&
          p.id !== selectedProduct.id &&
          p.stock > 0
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="product-detail">
        <button className="product-detail-back" onClick={() => setCurrentPage("products")}>
          ← Back to Products
        </button>
        <p>No product selected.</p>
      </div>
    );
  }

  const product: Product = selectedProduct;
  const isPreOwned = product.condition === "Pre-Owned";
  // Sold out only when inventory is 0 (after payment), not when cart holds remaining qty
  const isOutOfStock = isSoldOut(product);
  const remainingToAdd = getRemainingToAdd(product);
  const cartFull = !isOutOfStock && remainingToAdd <= 0;
  // Low-stock messaging only for NEW multi-unit items — pre-owned is always unique (1)
  const isLowStock = !isOutOfStock && !isPreOwned && product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.discount > 0;
  const savings = product.originalPrice - product.price;
  const maxSelectable = Math.max(1, remainingToAdd || 1);
  const wished = isInWishlist(product.id);

  const handleBack = () => {
    clearSelection();
    setCurrentPage("products");
  };

  const handleAddToCart = () => {
    if (isOutOfStock || cartFull) return;
    addToCart(product, isPreOwned ? 1 : Math.min(qty, remainingToAdd));
    setQty(1);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!cartFull) {
      addToCart(product, isPreOwned ? 1 : Math.min(qty, remainingToAdd));
      setQty(1);
    }
    setCurrentPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="product-detail">
      <div className="product-detail-breadcrumb">
        <button type="button" onClick={() => setCurrentPage("home")}>Home</button>
        <span>›</span>
        <button type="button" onClick={() => { clearSelection(); setCurrentPage("products"); }}>Products</button>
        <span>›</span>
        <span className="product-detail-breadcrumb-current">{product.category}</span>
      </div>

      <button className="product-detail-back" onClick={handleBack}>
        ← Back to Products
      </button>

      <div className="product-detail-content">
        <div className="product-detail-image-section">
          <div className="product-detail-image">
            <ProductImage src={product.image} alt={product.name} loading="eager" />
          </div>
          <div className="product-detail-badges">
            {product.condition === "New" && <span className="badge badge-new">New</span>}
            {product.condition === "Pre-Owned" && <span className="badge badge-preowned">Pre-Owned</span>}
            {isOutOfStock && <span className="badge badge-outofstock">Sold Out</span>}
            {isLowStock && !isOutOfStock && (
              <span className="badge badge-low-stock">Only {product.stock} left</span>
            )}
          </div>
          {hasDiscount && (
            <div className="product-detail-discount-badge">-{product.discount}%</div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-detail-brand">{product.brand}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <span className="product-detail-category">{product.category}</span>

          <div className="product-detail-price-section">
            <span className="product-detail-price">₹{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="product-detail-original-price">
                  ₹{formatPrice(product.originalPrice)}
                </span>
                <span className="product-detail-save">You save ₹{formatPrice(savings)}</span>
              </>
            )}
          </div>

          <div className="product-detail-rating">
            <div className="product-detail-stars">{renderStars(product.rating)}</div>
            <span className="product-detail-rating-text">{product.rating} / 5.0</span>
          </div>

          <div className="product-detail-status-badges">
            <span
              className={`detail-badge ${
                product.condition === "New"
                  ? "detail-badge-condition-new"
                  : "detail-badge-condition-preowned"
              }`}
            >
              {product.condition === "New" ? "✅" : "♻️"} {product.condition}
            </span>
            <span className="detail-badge detail-badge-warranty">
              🛡️ {product.warranty} Warranty
            </span>
            <span
              className={`detail-badge ${
                isOutOfStock
                  ? "detail-badge-stock-out"
                  : isLowStock
                  ? "detail-badge-stock-low"
                  : "detail-badge-stock-in"
              }`}
            >
              {isOutOfStock ? "🔴" : isLowStock ? "🟡" : "🟢"}{" "}
              {isOutOfStock
                ? "Sold Out"
                : isPreOwned
                ? "1 available (unique)"
                : isLowStock
                ? `Only ${product.stock} left`
                : `In Stock (${product.stock})`}
            </span>
          </div>

          <div className="product-detail-info-grid">
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Brand</span>
              <span className="product-detail-info-value">{product.brand}</span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Category</span>
              <span className="product-detail-info-value">{product.category}</span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Condition</span>
              <span className="product-detail-info-value">{product.condition}</span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Warranty</span>
              <span className="product-detail-info-value">{product.warranty}</span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Stock</span>
              <span className="product-detail-info-value">
                {isOutOfStock
                  ? "Sold Out"
                  : isPreOwned
                  ? "1 unique unit"
                  : `${product.stock} units`}
              </span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Rating</span>
              <span className="product-detail-info-value">{product.rating} / 5.0</span>
            </div>
          </div>

          <div>
            <div className="product-detail-description-title">Description</div>
            <p className="product-detail-description">{product.description}</p>
          </div>

          <div className="product-detail-actions">
            {isAdmin ? (
              <button className="product-detail-soldout-btn" disabled>
                🔒 Admin accounts cannot purchase products
              </button>
            ) : isOutOfStock ? (
              <button className="product-detail-soldout-btn" disabled>
                🔴 Sold Out — Check Back Later
              </button>
            ) : (
              <>
                {!isPreOwned && !cartFull && (
                  <div className="product-detail-qty-picker">
                    <button
                      type="button"
                      className="product-detail-qty-btn"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="product-detail-qty-val">
                      {Math.min(qty, maxSelectable)}
                    </span>
                    <button
                      type="button"
                      className="product-detail-qty-btn"
                      onClick={() => setQty((q) => Math.min(maxSelectable, q + 1))}
                      disabled={qty >= maxSelectable}
                      title={qty >= maxSelectable ? `Only ${maxSelectable} more can be added` : undefined}
                    >
                      +
                    </button>
                  </div>
                )}
                <button
                  className="product-detail-add-btn"
                  onClick={handleAddToCart}
                  disabled={cartFull}
                >
                  {cartFull
                    ? "✓ Max quantity in cart"
                    : `🛒 Add to Cart — ₹${formatPrice(product.price * (isPreOwned ? 1 : Math.min(qty, maxSelectable)))}`}
                </button>
                <button className="product-detail-buynow-btn" onClick={handleBuyNow}>
                  ⚡ Buy Now
                </button>
              </>
            )}
            <button
              type="button"
              className={`product-detail-wish-btn ${wished ? "active" : ""}`}
              onClick={() => toggleWishlist(product.id)}
              title={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wished ? "♥ Saved" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="product-detail-specs">
          <h2 className="product-detail-specs-title">📋 Specifications</h2>
          <div className="product-detail-specs-table">
            {Object.entries(product.specs)
              .filter(([, value]) => value != null && String(value).trim() !== "")
              .map(([key, value]) => (
                <div key={key} className="product-detail-spec-row">
                  <span className="product-detail-spec-key">{key}</span>
                  <span className="product-detail-spec-value">{value}</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="product-detail-related">
          <h2 className="product-detail-specs-title">You may also like</h2>
          <p className="product-detail-related-sub">More from {product.category}</p>
          <div className="product-detail-related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;

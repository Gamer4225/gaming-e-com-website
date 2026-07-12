// ProductDetail.tsx - Full product detail view when a user clicks on a product
import { useCart } from "../../context/CartContext";
import { useProductDetail, type Product } from "../../context/ProductDetailContext";
import "./ProductDetail.css";

// Helper: render star ratings
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

// Helper: format price in Indian Rupee
function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function ProductDetail({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { selectedProduct, clearSelection } = useProductDetail();
  const { addToCart } = useCart();

  // If no product is selected, go back to products
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
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.discount > 0;
  const savings = product.originalPrice - product.price;

  // Handle back button click
  const handleBack = () => {
    clearSelection();
    setCurrentPage("products");
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product-detail">
      {/* Back Button */}
      <button className="product-detail-back" onClick={handleBack}>
        ← Back to Products
      </button>

      {/* Main Content - Two Column Layout */}
      <div className="product-detail-content">
        {/* Image Section */}
        <div className="product-detail-image-section">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          {/* Badges */}
          <div className="product-detail-badges">
            {product.condition === "New" && <span className="badge badge-new">New</span>}
            {product.condition === "Pre-Owned" && <span className="badge badge-preowned">Pre-Owned</span>}
            {isOutOfStock && <span className="badge badge-outofstock">Sold Out</span>}
            {isLowStock && <span className="badge badge-low-stock">Only {product.stock} left</span>}
          </div>
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="product-detail-discount-badge">-{product.discount}%</div>
          )}
        </div>

        {/* Info Section */}
        <div className="product-detail-info">
          <span className="product-detail-brand">{product.brand}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <span className="product-detail-category">{product.category}</span>

          {/* Price Section */}
          <div className="product-detail-price-section">
            <span className="product-detail-price">₹{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="product-detail-original-price">₹{formatPrice(product.originalPrice)}</span>
                <span className="product-detail-save">You save ₹{formatPrice(savings)}</span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="product-detail-rating">
            <div className="product-detail-stars">{renderStars(product.rating)}</div>
            <span className="product-detail-rating-text">{product.rating} / 5.0</span>
          </div>

          {/* Status Badges */}
          <div className="product-detail-status-badges">
            <span className={`detail-badge ${product.condition === "New" ? "detail-badge-condition-new" : "detail-badge-condition-preowned"}`}>
              {product.condition === "New" ? "✅" : "♻️"} {product.condition}
            </span>
            <span className="detail-badge detail-badge-warranty">
              🛡️ {product.warranty} Warranty
            </span>
            <span className={`detail-badge ${isOutOfStock ? "detail-badge-stock-out" : isLowStock ? "detail-badge-stock-low" : "detail-badge-stock-in"}`}>
              {isOutOfStock ? "🔴" : isLowStock ? "🟡" : "🟢"}{" "}
              {isOutOfStock ? "Sold Out" : isLowStock ? `Only ${product.stock} left` : `In Stock (${product.stock})`}
            </span>
          </div>

          {/* Info Grid */}
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
              <span className="product-detail-info-value">{isOutOfStock ? "Sold Out" : `${product.stock} units`}</span>
            </div>
            <div className="product-detail-info-item">
              <span className="product-detail-info-label">Rating</span>
              <span className="product-detail-info-value">{product.rating} / 5.0</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="product-detail-description-title">Description</div>
            <p className="product-detail-description">{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="product-detail-actions">
            {isOutOfStock ? (
              <button className="product-detail-soldout-btn" disabled>
                🔴 Sold Out — Check Back Later
              </button>
            ) : (
              <button className="product-detail-add-btn" onClick={handleAddToCart}>
                🛒 Add to Cart — ₹{formatPrice(product.price)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

// ProductGrid.tsx - Displays a grid of ProductCard components
import ProductCard from "../ProductCard/ProductCard";
import { type Product } from "../../context/ProductDetailContext";
import "./ProductGrid.css";

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="product-grid">
        <div className="product-grid-empty">
          <div className="product-grid-empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;

// Wishlist.tsx - Products saved to wishlist (localStorage IDs)
import { useMemo } from "react";
import { useProductCatalog } from "../context/ProductCatalogContext";
import { useWishlist } from "../context/WishlistContext";
import ProductGrid from "../components/ProductGrid/ProductGrid";
import type { Product } from "../context/ProductDetailContext";
import "./StaticPages.css";

interface WishlistProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Wishlist({ setCurrentPage, setSelectedCategory }: WishlistProps) {
  const { wishlistIds, clearWishlist, wishlistCount } = useWishlist();
  const { products } = useProductCatalog();

  const wishProducts = useMemo(() => {
    const map = new Map((products as Product[]).map((p) => [p.id, p]));
    return wishlistIds.map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [wishlistIds, products]);

  return (
    <div className="static-page static-page-wide">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1>Wishlist</h1>
          <p className="static-lead" style={{ marginBottom: 16 }}>
            {wishlistCount === 0
              ? "Save products you like — stored only in this browser."
              : `${wishlistCount} saved item${wishlistCount > 1 ? "s" : ""}.`}
          </p>
        </div>
        {wishlistCount > 0 && (
          <button className="static-btn static-btn-secondary" onClick={() => clearWishlist()}>
            Clear wishlist
          </button>
        )}
      </div>

      {wishProducts.length === 0 ? (
        <div className="static-empty">
          <div className="static-empty-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on a product card to save it here.</p>
          <button
            className="static-btn static-btn-primary"
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage("products");
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <ProductGrid products={wishProducts} />
      )}
    </div>
  );
}

export default Wishlist;

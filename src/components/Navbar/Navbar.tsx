// Navbar.tsx - Gaming neon top navigation with category reset
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Navbar({ currentPage, setCurrentPage, searchQuery, setSearchQuery, setSelectedCategory }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    if (totalItems > 0) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
    // Reset category when navigating via navbar
    if (page === "products" || page === "home") {
      setSelectedCategory("All");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => handleNav("home")}>
          <span className="navbar-logo-icon">🎮</span>
          <span className="navbar-logo-text">GameVault</span>
        </div>

        <div className="navbar-links">
          <button className={`navbar-link ${currentPage === "home" ? "active" : ""}`} onClick={() => handleNav("home")}>Home</button>
          <button className={`navbar-link ${currentPage === "products" ? "active" : ""}`} onClick={() => handleNav("products")}>Products</button>
          <button className={`navbar-link ${currentPage === "cart" ? "active" : ""}`} onClick={() => handleNav("cart")}>Cart</button>
        </div>

        <div className="navbar-search">
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentPage !== "products") setCurrentPage("products");
            }}
          />
        </div>

        <button className={`navbar-cart ${shaking ? "cart-shake" : ""}`} onClick={() => handleNav("cart")}>
          <span className="navbar-cart-icon">🛒</span>
          <span>Cart</span>
          {totalItems > 0 && <span className="navbar-cart-badge">{totalItems}</span>}
        </button>

        <button className="navbar-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`navbar-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="navbar-mobile-search">
          <input type="text" placeholder="Search products..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (currentPage !== "products") setCurrentPage("products"); }}
          />
        </div>
        <button className={`navbar-link ${currentPage === "home" ? "active" : ""}`} onClick={() => handleNav("home")}>🏠 Home</button>
        <button className={`navbar-link ${currentPage === "products" ? "active" : ""}`} onClick={() => handleNav("products")}>📦 Products</button>
        <button className={`navbar-link ${currentPage === "cart" ? "active" : ""}`} onClick={() => handleNav("cart")}>🛒 Cart ({totalItems})</button>
      </div>
    </>
  );
}

export default Navbar;

// Navbar.tsx - Gaming neon top navigation; cart opens slide-over drawer
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { LogoIcon, SearchIcon, CartIcon } from "../Icons/Icons";
import "./Navbar.css";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Navbar({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  setSelectedCategory,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { totalItems, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();

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
    if (page === "products" || page === "home") {
      setSelectedCategory("All");
    }
  };

  const handleOpenCart = () => {
    setMobileOpen(false);
    openCartDrawer();
  };

  return (
    <>
      <nav className="navbar">
        <div
          className="navbar-logo"
          onClick={() => handleNav("home")}
          title="GameVault Home"
          aria-label="GameVault Home"
        >
          <span className="navbar-logo-icon">
            <LogoIcon size={40} title="GameVault" />
          </span>
          <span className="navbar-logo-text">GameVault</span>
        </div>

        <div className="navbar-links">
          <button
            className={`navbar-link ${currentPage === "home" ? "active" : ""}`}
            onClick={() => handleNav("home")}
          >
            Home
          </button>
          <button
            className={`navbar-link ${currentPage === "products" ? "active" : ""}`}
            onClick={() => handleNav("products")}
          >
            Products
          </button>
          <button
            className={`navbar-link ${currentPage === "wishlist" ? "active" : ""}`}
            onClick={() => handleNav("wishlist")}
          >
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </button>
          <button
            className={`navbar-link ${currentPage === "orders" ? "active" : ""}`}
            onClick={() => handleNav("orders")}
          >
            Orders
          </button>
        </div>

        <div className="navbar-search">
          <span className="navbar-search-icon">
            <SearchIcon size={16} />
          </span>
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

        <button
          type="button"
          className={`navbar-cart ${shaking ? "cart-shake" : ""}`}
          onClick={handleOpenCart}
          aria-label="Open cart"
        >
          <span className="navbar-cart-icon">
            <CartIcon size={18} />
          </span>
          <span>Cart</span>
          {totalItems > 0 && <span className="navbar-cart-badge">{totalItems}</span>}
        </button>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div className={`navbar-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="navbar-mobile-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentPage !== "products") setCurrentPage("products");
            }}
          />
        </div>
        <button
          className={`navbar-link ${currentPage === "home" ? "active" : ""}`}
          onClick={() => handleNav("home")}
        >
          Home
        </button>
        <button
          className={`navbar-link ${currentPage === "products" ? "active" : ""}`}
          onClick={() => handleNav("products")}
        >
          Products
        </button>
        <button
          className={`navbar-link ${currentPage === "wishlist" ? "active" : ""}`}
          onClick={() => handleNav("wishlist")}
        >
          Wishlist ({wishlistCount})
        </button>
        <button
          className={`navbar-link ${currentPage === "orders" ? "active" : ""}`}
          onClick={() => handleNav("orders")}
        >
          Orders
        </button>
        <button className="navbar-link" onClick={handleOpenCart}>
          Cart ({totalItems})
        </button>
        <button
          className={`navbar-link ${currentPage === "about" ? "active" : ""}`}
          onClick={() => handleNav("about")}
        >
          About
        </button>
        <button
          className={`navbar-link ${currentPage === "contact" ? "active" : ""}`}
          onClick={() => handleNav("contact")}
        >
          Contact
        </button>
        <button
          className={`navbar-link ${currentPage === "faq" ? "active" : ""}`}
          onClick={() => handleNav("faq")}
        >
          FAQ
        </button>
      </div>
    </>
  );
}

export default Navbar;

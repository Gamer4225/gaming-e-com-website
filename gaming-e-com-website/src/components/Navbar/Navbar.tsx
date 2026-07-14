// Navbar.tsx - Gaming neon top navigation; cart opens slide-over drawer
import { useState, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { LogoIcon, SearchIcon, CartIcon, UserIcon, LogoutIcon } from "../Icons/Icons";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (totalItems > 0) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [userMenuOpen]);

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

        {/* User / Auth */}
        {user ? (
          <div className="navbar-user-menu" ref={userMenuRef}>
            <button
              className={`navbar-user-btn ${userMenuOpen ? "active" : ""}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <UserIcon size={16} />
              <span>{user.name.split(" ")[0]}</span>
              {user.role === "admin" && <span className="navbar-admin-badge">ADMIN</span>}
            </button>
            {userMenuOpen && (
              <div className="navbar-user-dropdown">
                <div className="navbar-user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  {user.role === "admin" && <span className="navbar-role-badge">Admin</span>}
                </div>
                {user.role === "admin" && (
                  <button onClick={() => { handleNav("admin-dashboard"); setUserMenuOpen(false); }} style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    ⚙ Admin Panel
                  </button>
                )}
                <button onClick={() => { handleNav("orders"); setUserMenuOpen(false); }}>
                  My Orders
                </button>
                <button onClick={() => { handleNav("wishlist"); setUserMenuOpen(false); }}>
                  Wishlist
                </button>
                <button className="navbar-logout-btn" onClick={() => { logout(); setUserMenuOpen(false); }}>
                  <LogoutIcon size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className={`navbar-link navbar-login-btn ${currentPage === "login" ? "active" : ""}`}
            onClick={() => handleNav("login")}
          >
            Login
          </button>
        )}

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
        {user ? (
          <>
            <div className="navbar-mobile-user">
              {user.role === "admin" && <span className="navbar-admin-badge">ADMIN</span>}
              <strong>{user.name}</strong>
            </div>
            {user.role === "admin" && (
              <button className="navbar-link" onClick={() => handleNav("admin-dashboard")} style={{ color: "var(--color-primary)" }}>
                ⚙ Admin Panel
              </button>
            )}
            <button className="navbar-link" onClick={() => { handleNav("orders"); }}>
              My Orders
            </button>
            <button className="navbar-link" onClick={() => { logout(); handleNav("home"); }}>
              Logout
            </button>
          </>
        ) : (
          <button
            className={`navbar-link ${currentPage === "login" ? "active" : ""}`}
            onClick={() => handleNav("login")}
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </>
  );
}

export default Navbar;

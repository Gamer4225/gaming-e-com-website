// App.tsx - Main application entry point
// Manages page routing and global state
import { useState, useEffect, type ReactNode } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductDetailProvider, useProductDetail } from "./context/ProductDetailContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminChangePassword from "./pages/AdminChangePassword";
import SubAdminDashboard from "./pages/SubAdminDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import StaffProducts from "./pages/StaffProducts";
import CustomerAccount from "./pages/CustomerAccount";
import AdminMostOrdered from "./pages/AdminMostOrdered";
import AdminMostWishlisted from "./pages/AdminMostWishlisted";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import "./styles/global.css";

const AdminLayout = ({ currentPage, setCurrentPage, children }: { currentPage: string; setCurrentPage: (p: string) => void; children: ReactNode }) => {
  const { user, logout } = useAuth();
  const role = user?.role || "customer";
  const isAdmin = role === "admin";
  const isSubAdmin = role === "sub-admin";
  const isMerchant = role === "merchant";
  const isSeller = role === "seller";

  const tabs: { id: string; label: string; icon: string }[] = [];
  if (isAdmin) tabs.push(
    { id: "admin-dashboard", label: "Dashboard", icon: "📊" },
    { id: "admin-products", label: "Products", icon: "📦" },
    { id: "admin-orders", label: "Orders", icon: "📋" },
    { id: "admin-users", label: "Users", icon: "👥" },
    { id: "admin-ordered", label: "Most Ordered", icon: "🔥" },
    { id: "admin-wishlisted", label: "Most Wishlisted", icon: "💜" },
    { id: "admin-password", label: "Change Password", icon: "🔑" },
  );
  else if (isSubAdmin) tabs.push(
    { id: "sub-dashboard", label: "Dashboard", icon: "📊" },
    { id: "staff-products", label: "Products", icon: "📦" },
    { id: "admin-orders", label: "Orders", icon: "📋" },
    { id: "admin-ordered", label: "Most Ordered", icon: "🔥" },
    { id: "admin-password", label: "Change Password", icon: "🔑" },
  );
  else if (isMerchant) tabs.push(
    { id: "merchant-dashboard", label: "Dashboard", icon: "📊" },
    { id: "staff-products", label: "My Products", icon: "📦" },
    { id: "admin-ordered", label: "Most Ordered", icon: "🔥" },
    { id: "admin-password", label: "Change Password", icon: "🔑" },
  );
  else if (isSeller) tabs.push(
    { id: "seller-dashboard", label: "Dashboard", icon: "📊" },
    { id: "staff-products", label: "My Listings", icon: "📦" },
    { id: "admin-password", label: "Change Password", icon: "🔑" },
  );

  const roleLabel = isAdmin ? "Admin" : isSubAdmin ? "Sub-Admin" : isMerchant ? "Merchant" : "Seller";
  const currentTab = tabs.find(t => t.id === currentPage);
  const pageTitle = currentTab?.label || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo">GV</div>
          <div>
            <div className="name">GameVault</div>
          </div>
          <span className="badge">{roleLabel}</span>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <a key={t.id} className={currentPage === t.id ? "active" : ""} onClick={() => setCurrentPage(t.id)}>
              <span className="ico">{t.icon}</span> {t.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "?"}</div>
            <div className="info">
              <div className="un">{user?.name}</div>
              <div className="rl">{roleLabel}</div>
            </div>
          </div>
          <a onClick={() => { logout(); setCurrentPage("home"); }} style={{ marginTop: 8, color: "#ef4444" }}>
            <span className="ico">🚪</span> Logout
          </a>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <div className="breadcrumb">Admin <span>› {pageTitle}</span></div>
          </div>
          <div className="admin-topbar-right">
            <button className="btn-back" onClick={() => setCurrentPage("home")}>← Back to Store</button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useCart();
  const { selectedProduct, clearSelection } = useProductDetail();

  useEffect(() => {
    if (selectedProduct) {
      setCurrentPage("detail");
    }
  }, [selectedProduct]);

  const handleSetCurrentPage = (page: string) => {
    if (page !== "detail") {
      clearSelection();
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFullWidthPage =
    currentPage === "home" ||
    currentPage === "checkout" ||
    currentPage === "order-success" ||
    currentPage === "about" ||
    currentPage === "contact" ||
    currentPage === "faq" ||
    currentPage === "orders" ||
    currentPage === "wishlist" ||
    currentPage === "login" ||
    currentPage === "signup" ||
    currentPage === "admin-dashboard" ||
    currentPage === "admin-products" ||
    currentPage === "admin-orders" ||
    currentPage === "admin-users" ||
    currentPage === "admin-password" ||
    currentPage === "admin-ordered" ||
    currentPage === "admin-wishlisted" ||
    currentPage === "staff-dashboard" ||
    currentPage === "sub-dashboard" ||
    currentPage === "merchant-dashboard" ||
    currentPage === "seller-dashboard" ||
    currentPage === "staff-products" ||
    currentPage === "account";

  const renderPage = () => {
    switch (currentPage) {
      case "detail":
        return <ProductDetail setCurrentPage={handleSetCurrentPage} />;
      case "home":
        return (
          <Home
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
            setSearchQuery={setSearchQuery}
          />
        );
      case "products":
        return (
          <Products
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentPage={handleSetCurrentPage}
          />
        );
      case "checkout":
        return <Checkout setCurrentPage={handleSetCurrentPage} />;
      case "order-success":
        return (
          <OrderSuccess
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "about":
        return (
          <About
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "contact":
        return <Contact setCurrentPage={handleSetCurrentPage} />;
      case "faq":
        return <FAQ setCurrentPage={handleSetCurrentPage} />;
      case "orders":
        return (
          <Orders
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "wishlist":
        return (
          <Wishlist
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "login":
        return <Login setCurrentPage={handleSetCurrentPage} />;
      case "signup":
        return <Signup setCurrentPage={handleSetCurrentPage} />;
      case "admin-dashboard":
        return <AdminDashboard setCurrentPage={handleSetCurrentPage} activePage="admin-dashboard" />;
      case "admin-products":
        return <AdminProducts setCurrentPage={handleSetCurrentPage} activePage="admin-products" />;
      case "admin-orders":
        return <AdminOrders setCurrentPage={handleSetCurrentPage} activePage="admin-orders" />;
      case "admin-users":
        return <AdminUsers setCurrentPage={handleSetCurrentPage} activePage="admin-users" />;
      case "admin-password":
        return <AdminChangePassword setCurrentPage={handleSetCurrentPage} activePage="admin-password" />;
      case "admin-ordered":
        return <AdminMostOrdered setCurrentPage={handleSetCurrentPage} activePage="admin-ordered" />;
      case "admin-wishlisted":
        return <AdminMostWishlisted setCurrentPage={handleSetCurrentPage} activePage="admin-wishlisted" />;
      case "sub-dashboard":
        return <SubAdminDashboard setCurrentPage={handleSetCurrentPage} />;
      case "merchant-dashboard":
        return <MerchantDashboard setCurrentPage={handleSetCurrentPage} />;
      case "seller-dashboard":
        return <SellerDashboard setCurrentPage={handleSetCurrentPage} />;
      case "staff-dashboard":
        return <SellerDashboard setCurrentPage={handleSetCurrentPage} />;
      case "staff-products":
        return <StaffProducts setCurrentPage={handleSetCurrentPage} />;
      case "account":
        return <CustomerAccount setCurrentPage={handleSetCurrentPage} />;
      default:
        return (
          <Home
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
            setSearchQuery={setSearchQuery}
          />
        );
    }
  };

  return (
    <div className="app">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
      />

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}

      {isFullWidthPage ? (
        <>
          {currentPage.startsWith("admin-") ? (
            <AdminLayout currentPage={currentPage} setCurrentPage={handleSetCurrentPage}>
              {renderPage()}
            </AdminLayout>
          ) : (
            <div className="page-content-full">{renderPage()}</div>
          )}
        </>
      ) : (
        <div className="page-layout">
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setCurrentPage={handleSetCurrentPage}
          />
          <main className="page-content">{renderPage()}</main>
        </div>
      )}

      <Footer
        setCurrentPage={handleSetCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />

      <CartDrawer
        setCurrentPage={handleSetCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductCatalogProvider>
        <CartProvider>
          <WishlistProvider>
            <ProductDetailProvider>
              <AppContent />
            </ProductDetailProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductCatalogProvider>
    </AuthProvider>
  );
}

export default App;

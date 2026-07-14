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
import CartDrawer from "./components/CartDrawer/CartDrawer";
import "./styles/global.css";

const AdminLayout = ({ currentPage, setCurrentPage, children }: { currentPage: string; setCurrentPage: (p: string) => void; children: ReactNode }) => {
  const { user, logout } = useAuth();
  const tabs = [
    { id: "admin-dashboard", label: "Dashboard" },
    { id: "admin-products", label: "Products" },
    { id: "admin-orders", label: "Orders" },
    { id: "admin-users", label: "Users" },
    { id: "admin-password", label: "Change Password" },
  ];
  return (
    <div className="admin-layout">
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <span className="admin-topbar-badge">Admin</span>
          <span className="admin-topbar-title">GameVault Admin Panel</span>
        </div>
        <div className="admin-topbar-right">
          <span>{user?.name}</span>
          <button className="btn btn-sm btn-sec" onClick={() => { logout(); setCurrentPage("home"); }}>Logout</button>
          <button className="btn btn-sm btn-sec" onClick={() => setCurrentPage("home")}>← Store</button>
        </div>
      </div>
      <div className="admin-nav">
        {tabs.map(t => (
          <button key={t.id} className={`admin-nav-btn ${currentPage === t.id ? "active" : ""}`} onClick={() => setCurrentPage(t.id)}>{t.label}</button>
        ))}
      </div>
      {children}
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
    currentPage === "admin-password";

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

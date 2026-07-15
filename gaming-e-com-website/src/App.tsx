// App.tsx - Clean separation: Admin Panel vs Customer Store
import { useState, useEffect, type ReactNode } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ProductDetailProvider, useProductDetail } from "./context/ProductDetailContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { getPermissions } from "./context/PermissionContext";
import { getAdminTabs } from "./config/adminRouteConfig";
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
import ProductManagement from "./pages/ProductManagement";
// ProductManagement is the unified component for all roles
import AdminOrders from "./pages/AdminOrders";
import AdminChangePassword from "./pages/AdminChangePassword";
import SubAdminDashboard from "./pages/SubAdminDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CustomerAccount from "./pages/CustomerAccount";
import CompareProducts from "./pages/CompareProducts";
import AdminMostOrdered from "./pages/AdminMostOrdered";
import AdminMostWishlisted from "./pages/AdminMostWishlisted";
import AdminAccounts from "./pages/AdminAccounts";
import AdminCategories from "./pages/AdminCategories";
import AdminReviews from "./pages/AdminReviews";
import AdminCoupons from "./pages/AdminCoupons";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import "./styles/global.css";

// ==================== ADMIN LAYOUT ====================
const AdminLayout = ({ currentPage, setCurrentPage, children }: { currentPage: string; setCurrentPage: (p: string) => void; children: ReactNode }) => {
  const { user, logout } = useAuth();
  const perms = getPermissions((user?.role || "customer") as any);
  const tabs = getAdminTabs(perms, user?.role || "");

  const currentTab = tabs.find(t => t.id === currentPage);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="admin-sidebar">
        <div className="sidebar-brand"><div className="logo">GV</div><div><div className="name">GameVault</div></div><span className="badge">{perms.panelLabel}</span></div>
        <nav className="sidebar-nav">{tabs.map(t => <a key={t.id} className={currentPage === t.id ? "active" : ""} onClick={() => setCurrentPage(t.id)}><span className="ico">{t.icon}</span> {t.label}</a>)}</nav>
        <div className="sidebar-footer">
          <div className="sidebar-user"><div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "?"}</div><div className="info"><div className="un">{user?.name}</div><div className="rl">{perms.panelLabel}</div></div></div>
          <a onClick={() => { logout(); setCurrentPage("home"); }} style={{ marginTop: 8, color: "#f87171" }}><span className="ico">↪</span> Logout</a>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar"><div><div className="breadcrumb">{perms.panelLabel} <span>› {currentTab?.label || "Dashboard"}</span></div></div><div className="admin-topbar-right"><button className="btn-back" onClick={() => setCurrentPage(perms.dashboardPage)}>← Back to Dashboard</button></div></div>
        {children}
      </div>
    </div>
  );
};

// ==================== CUSTOMER STORE ====================
function CustomerStore({ currentPage, setCurrentPage, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery }: {
  currentPage: string; setCurrentPage: (p: string) => void;
  selectedCategory: string; setSelectedCategory: (c: string) => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
}) {
  const { toast } = useCart();
  const { selectedProduct, clearSelection } = useProductDetail();
  useEffect(() => { if (selectedProduct) setCurrentPage("detail"); }, [selectedProduct]);

  const go = (page: string) => {
    if (page !== "detail") clearSelection();
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFull = currentPage === "home" || currentPage === "checkout" || currentPage === "order-success" ||
    currentPage === "about" || currentPage === "contact" || currentPage === "faq" ||
    currentPage === "orders" || currentPage === "wishlist" || currentPage === "login" || currentPage === "signup" || currentPage === "account" ||
    currentPage === "compare";

  const render = () => {
    switch (currentPage) {
      case "detail": return <ProductDetail setCurrentPage={go} />;
      case "home": return <Home setCurrentPage={go} setSelectedCategory={setSelectedCategory} setSearchQuery={setSearchQuery} />;
      case "products": return <Products selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={go} />;
      case "checkout": return <Checkout setCurrentPage={go} />;
      case "order-success": return <OrderSuccess setCurrentPage={go} setSelectedCategory={setSelectedCategory} />;
      case "about": return <About setCurrentPage={go} setSelectedCategory={setSelectedCategory} />;
      case "contact": return <Contact setCurrentPage={go} />;
      case "faq": return <FAQ setCurrentPage={go} />;
      case "orders": return <Orders setCurrentPage={go} setSelectedCategory={setSelectedCategory} />;
      case "wishlist": return <Wishlist setCurrentPage={go} setSelectedCategory={setSelectedCategory} />;
      case "login": return <Login setCurrentPage={go} />;
      case "signup": return <Signup setCurrentPage={go} />;
      case "compare": return <CompareProducts setCurrentPage={go} />;
      case "account": return <CustomerAccount setCurrentPage={go} />;
      default: return <Home setCurrentPage={go} setSelectedCategory={setSelectedCategory} setSearchQuery={setSearchQuery} />;
    }
  };

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={go} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectedCategory={setSelectedCategory} />
      {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}
      {isFull ? <div className="page-content-full">{render()}</div> : (
        <div className="page-layout">
          <Sidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} setCurrentPage={go} />
          <main className="page-content">{render()}</main>
        </div>
      )}
      <Footer setCurrentPage={go} setSelectedCategory={setSelectedCategory} />
      <CartDrawer setCurrentPage={go} setSelectedCategory={setSelectedCategory} />
    </div>
  );
}

// ==================== ADMIN PANEL ====================
function AdminPanel({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (p: string) => void }) {
  const { selectedProduct, clearSelection } = useProductDetail();
  useEffect(() => { if (selectedProduct) setCurrentPage("detail"); }, [selectedProduct]);

  const go = (page: string) => {
    if (page !== "detail") clearSelection();
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const render = () => {
    switch (currentPage) {
      case "admin-dashboard": return <AdminDashboard setCurrentPage={go} />;
      case "admin-products": return <ProductManagement setCurrentPage={go} />;
      case "admin-orders": return <AdminOrders setCurrentPage={go} />;
            case "admin-ordered": return <AdminMostOrdered setCurrentPage={go} />;
      case "admin-wishlisted": return <AdminMostWishlisted setCurrentPage={go} />;
      case "admin-inventory": return <AdminInventory setCurrentPage={go} />;
      case "admin-categories": return <AdminCategories setCurrentPage={go} />;
      case "admin-accounts": return <AdminAccounts setCurrentPage={go} />;
            case "admin-reviews": return <AdminReviews setCurrentPage={go} />;
      case "admin-coupons": return <AdminCoupons setCurrentPage={go} />;
      case "admin-logs": return <AdminActivityLogs setCurrentPage={go} />;
      case "admin-reports": return <AdminReports setCurrentPage={go} />;
      case "admin-settings": return <AdminSettings setCurrentPage={go} />;
      case "admin-password": return <AdminChangePassword setCurrentPage={go} />;
      case "sub-dashboard": return <SubAdminDashboard setCurrentPage={go} />;
      case "merchant-dashboard": return <MerchantDashboard setCurrentPage={go} />;
      case "seller-dashboard": return <SellerDashboard setCurrentPage={go} />;
      case "staff-products": return <ProductManagement setCurrentPage={go} />;
      default: return <AdminDashboard setCurrentPage={go} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} setCurrentPage={go}>
      {render()}
    </AdminLayout>
  );
}

// ==================== ROOT ROUTER ====================
function AppRouter() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Staff-only pages trigger AdminPanel
  const isStaffPage = currentPage.startsWith("admin-") || currentPage.startsWith("sub-") || currentPage.startsWith("merchant-") || currentPage.startsWith("seller-") || currentPage.startsWith("staff-");

  // Staff pages → admin panel
  if (isStaffPage) {
    return <AdminPanel currentPage={currentPage} setCurrentPage={setCurrentPage} />;
  }

  // Everything else (home, products, wishlist, orders, login, signup, etc.) → CustomerStore
  return (
    <CustomerStore currentPage={currentPage} setCurrentPage={setCurrentPage}
      selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
      searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductCatalogProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider><NotificationProvider><RecentlyViewedProvider>
            <ProductDetailProvider>
              <AppRouter />
            </ProductDetailProvider>
          </RecentlyViewedProvider></NotificationProvider></CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductCatalogProvider>
    </AuthProvider>
  );
}

export default App;

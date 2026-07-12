// App.tsx - Main application entry point
// Manages page routing and global state
import { useState, useEffect } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductDetailProvider, useProductDetail } from "./context/ProductDetailContext";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import CartPage from "./pages/CartPage";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import "./styles/global.css";

// Inner App component that uses contexts for toast notifications and product detail
function AppContent() {
  // Current page state (simple routing without react-router)
  const [currentPage, setCurrentPage] = useState("home");
  // Selected category for filtering products
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Search query shared between navbar and products page
  const [searchQuery, setSearchQuery] = useState("");
  // Toast message from cart context
  const { toast } = useCart();
  // Selected product for detail view
  const { selectedProduct, clearSelection } = useProductDetail();

  // When a product is selected via the context, automatically switch to detail page
  useEffect(() => {
    if (selectedProduct) {
      setCurrentPage("detail");
    }
  }, [selectedProduct]);

  // Wrapper for setCurrentPage that also clears product selection when leaving detail
  const handleSetCurrentPage = (page: string) => {
    if (page !== "detail") {
      clearSelection();
    }
    setCurrentPage(page);
  };

  // Render the active page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case "detail":
        return <ProductDetail setCurrentPage={handleSetCurrentPage} />;
      case "home":
        return (
          <Home
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
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
      case "cart":
        return <CartPage setCurrentPage={handleSetCurrentPage} setSelectedCategory={setSelectedCategory} />;
      default:
        return (
          <Home
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}

      {/* Page Layout */}
      {currentPage === "home" ? (
        // Home page - full width, no sidebar
        <div className="page-content-full">{renderPage()}</div>
      ) : currentPage === "cart" ? (
        // Cart page - full width, no sidebar
        <div className="page-content-full">{renderPage()}</div>
      ) : (
        // Products & Detail pages - with sidebar
        <div className="page-layout">
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setCurrentPage={handleSetCurrentPage}
          />
          <main className="page-content">{renderPage()}</main>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Root App component wraps everything in providers for global state
function App() {
  return (
    <CartProvider>
      <ProductDetailProvider>
        <AppContent />
      </ProductDetailProvider>
    </CartProvider>
  );
}

export default App;

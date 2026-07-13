// App.tsx - Main application entry point
// Manages page routing and global state
import { useState, useEffect } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductCatalogProvider } from "./context/ProductCatalogContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductDetailProvider, useProductDetail } from "./context/ProductDetailContext";
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
import CartDrawer from "./components/CartDrawer/CartDrawer";
import "./styles/global.css";

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
    currentPage === "wishlist";

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
        <div className="page-content-full">{renderPage()}</div>
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
    <ProductCatalogProvider>
      <CartProvider>
        <WishlistProvider>
          <ProductDetailProvider>
            <AppContent />
          </ProductDetailProvider>
        </WishlistProvider>
      </CartProvider>
    </ProductCatalogProvider>
  );
}

export default App;

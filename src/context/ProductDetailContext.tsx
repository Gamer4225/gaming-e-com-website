// ProductDetailContext.tsx - Context for viewing product details when a card is clicked
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Shared Product interface used across the app
export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  condition: string;
  warranty: string;
  rating: number;
  stock: number;
  description: string;
  image: string;
  featured?: boolean;
  /** Detailed key/value specifications for the product detail page */
  specs?: Record<string, string | undefined>;
}

interface ProductDetailContextValue {
  selectedProduct: Product | null;
  viewProduct: (product: Product) => void;
  clearSelection: () => void;
}

const ProductDetailContext = createContext<ProductDetailContextValue | undefined>(undefined);

// Custom hook to access product detail context
export function useProductDetail() {
  const ctx = useContext(ProductDetailContext);
  if (!ctx) throw new Error("useProductDetail must be used within ProductDetailProvider");
  return ctx;
}

// Provider component wraps the app and provides product detail state
export function ProductDetailProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const viewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <ProductDetailContext.Provider value={{ selectedProduct, viewProduct, clearSelection }}>
      {children}
    </ProductDetailContext.Provider>
  );
}

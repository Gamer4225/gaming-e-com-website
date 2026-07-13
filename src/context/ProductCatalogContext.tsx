// ProductCatalogContext.tsx — loads products from backend SQLite API
// Falls back to local products.json if API is unavailable
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import fallbackProducts from "../data/products.json";
import type { Product } from "./ProductDetailContext";

// In Vite dev, proxy /api → backend. Absolute URL still works if opened cross-origin.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "";

interface ProductCatalogContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  source: "api" | "fallback";
  refreshProducts: () => Promise<void>;
  applyStockUpdates: (updates: { id: number; stock: number }[]) => void;
  getProductById: (id: number) => Product | undefined;
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | undefined>(
  undefined
);

export function useProductCatalog(): ProductCatalogContextValue {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return ctx;
}

function normalize(list: Product[]): Product[] {
  return list.map((p) => ({
    ...p,
    stock: Number(p.stock) || 0,
    price: Number(p.price) || 0,
    originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
    discount: Number(p.discount) || 0,
    rating: Number(p.rating) || 0,
    featured: !!p.featured,
  }));
}

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    normalize(fallbackProducts as Product[])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as Product[];
      if (!Array.isArray(data) || data.length === 0) throw new Error("Empty catalog");
      setProducts(normalize(data));
      setSource("api");
      setError(null);
    } catch (e) {
      setSource("fallback");
      setError(e instanceof Error ? e.message : "API unavailable");
      // keep existing / seed fallback
      setProducts((prev) => (prev.length ? prev : normalize(fallbackProducts as Product[])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const applyStockUpdates = useCallback((updates: { id: number; stock: number }[]) => {
    if (!updates?.length) return;
    const map = new Map(updates.map((u) => [u.id, u.stock]));
    setProducts((prev) =>
      prev.map((p) => (map.has(p.id) ? { ...p, stock: map.get(p.id)! } : p))
    );
  }, []);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  return (
    <ProductCatalogContext.Provider
      value={{
        products,
        loading,
        error,
        source,
        refreshProducts,
        applyStockUpdates,
        getProductById,
      }}
    >
      {children}
    </ProductCatalogContext.Provider>
  );
}

export { API_BASE };

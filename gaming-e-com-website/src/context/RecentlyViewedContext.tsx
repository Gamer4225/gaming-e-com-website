// context/RecentlyViewedContext.tsx — Track last 12 viewed products
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useProductCatalog } from "./ProductCatalogContext";
import type { Product } from "./ProductDetailContext";

interface RecentlyViewedValue {
  viewedIds: number[];
  viewedProducts: Product[];
  addView: (product: Product) => void;
}

const KEY = "gamevault_recently_viewed";
const MAX = 12;
const Context = createContext<RecentlyViewedValue | undefined>(undefined);

export function useRecentlyViewed(): RecentlyViewedValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useRecentlyViewed must be used within provider");
  return ctx;
}

function load(): number[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => load());
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const addView = useCallback((product: Product) => {
    setIds(prev => {
      const next = prev.filter(id => id !== product.id);
      next.unshift(product.id);
      return next.slice(0, MAX);
    });
  }, []);

  const { products } = useProductCatalog();
  const viewedProducts = (products as Product[]).filter(p => ids.includes(p.id));

  return <Context.Provider value={{ viewedIds: ids, viewedProducts, addView }}>{children}</Context.Provider>;
}

// context/CompareContext.tsx — Product comparison for gaming hardware
// Persists up to 4 items in localStorage for side-by-side comparison.
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useProductCatalog } from "./ProductCatalogContext";
import type { Product } from "./ProductDetailContext";

interface CompareContextValue {
  compareIds: number[];
  compareProducts: Product[];
  isComparing: (id: number) => boolean;
  toggleCompare: (product: Product) => void;
  removeCompare: (id: number) => void;
  clearCompare: () => void;
}

const KEY = "gamevault_compare";
const MAX = 4;
const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

function loadIds(): number[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => loadIds());
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const { products } = useProductCatalog();
  const compareProducts = (products as Product[]).filter(p => ids.includes(p.id)).slice(0, MAX);

  const isComparing = useCallback((id: number) => ids.includes(id), [ids]);
  
  const toggleCompare = useCallback((product: Product) => {
    setIds(prev => {
      if (prev.includes(product.id)) return prev.filter(id => id !== product.id);
      if (prev.length >= MAX) return prev; // max reached
      return [...prev, product.id];
    });
  }, []);

  const removeCompare = useCallback((id: number) => setIds(prev => prev.filter(x => x !== id)), []);
  const clearCompare = useCallback(() => setIds([]), []);

  return (
    <CompareContext.Provider value={{ compareIds: ids, compareProducts, isComparing, toggleCompare, removeCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

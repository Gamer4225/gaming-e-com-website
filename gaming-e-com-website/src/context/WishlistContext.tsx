// WishlistContext.tsx — Pure localStorage + direct API calls
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { API_BASE } from "./ProductCatalogContext";

interface WishlistContextValue { wishlistIds: number[]; isInWishlist: (id: number) => boolean; toggleWishlist: (id: number) => void; removeFromWishlist: (id: number) => void; clearWishlist: () => void; wishlistCount: number }

const KEY = "gamevault_wishlist";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

function load(): number[] { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => load());
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const toggleWishlist = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      fetch(`${API_BASE}/api/wishlist/${id}`, { method: "POST" }).catch(() => {});
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => setIds(p => p.filter(x => x !== id)), []);
  const clearWishlist = useCallback(() => setIds([]), []);
  const isInWishlist = useCallback((id: number) => ids.includes(id), [ids]);

  return (
    <WishlistContext.Provider value={{ wishlistIds: ids, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

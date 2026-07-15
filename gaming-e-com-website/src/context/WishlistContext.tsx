// WishlistContext.tsx — Server is source of truth, localStorage is offline cache
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { API_BASE } from "./ProductCatalogContext";

interface WishlistContextValue { wishlistIds: number[]; isInWishlist: (id: number) => boolean; toggleWishlist: (id: number) => void; removeFromWishlist: (id: number) => void; clearWishlist: () => void; wishlistCount: number; loading: boolean }

const KEY = "gamevault_wishlist";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

function loadLocal(): number[] { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => loadLocal());
  const [loading, setLoading] = useState(true);

  // On mount: load from server (source of truth), fall back to localStorage
  useEffect(() => {
    fetch(`${API_BASE}/api/wishlist`)
      .then(r => r.json())
      .then(data => {
        if (data?.ids && Array.isArray(data.ids)) {
          setIds(data.ids.filter((n: any) => typeof n === "number"));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Persist to localStorage as offline cache
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const toggleWishlist = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // Send to server (fire-and-forget)
      fetch(`${API_BASE}/api/wishlist/${id}`, { method: "POST" }).catch(() => {});
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => setIds(p => p.filter(x => x !== id)), []);
  const clearWishlist = useCallback(() => setIds([]), []);
  const isInWishlist = useCallback((id: number) => ids.includes(id), [ids]);

  return (
    <WishlistContext.Provider value={{ wishlistIds: ids, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: ids.length, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

// WishlistContext.tsx — Simple direct API calls (like Reviews)
// Every toggle hits the server immediately. No debounce, no sync loop.
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { API_BASE } from "./ProductCatalogContext";

interface WishlistContextValue {
  wishlistIds: number[];
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (id: number) => void;
  removeFromWishlist: (id: number) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WISHLIST_KEY = "gamevault_wishlist";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

function loadIds(): number[] {
  try { const r = localStorage.getItem(WISHLIST_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => loadIds());

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds)); }, [wishlistIds]);

  // Toggle: add/remove from local state AND immediately call server (no conditions)
  const toggleWishlist = useCallback((id: number) => {
    setWishlistIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Fire and forget — server call, same pattern as Reviews
      fetch(`${API_BASE}/api/wishlist/${id}`, { method: "POST" }).catch(() => {});
      return updated;
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearWishlist = useCallback(() => setWishlistIds([]), []);

  const isInWishlist = useCallback(
    (id: number) => wishlistIds.includes(id),
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: wishlistIds.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

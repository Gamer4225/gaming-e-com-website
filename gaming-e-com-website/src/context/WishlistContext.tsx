// WishlistContext.tsx — Persist wishlist in localStorage + sync to server
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { API_BASE } from "./ProductCatalogContext";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  wishlistIds: number[];
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (id: number, name?: string) => void;
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
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch { return []; }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => loadIds());
  const { token } = useAuth();

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    if (!token || wishlistIds.length === 0) return;
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/api/wishlist/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: wishlistIds }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [wishlistIds, token]);

  const toggleWishlist = useCallback(
    (id: number) => {
      setWishlistIds((prev) => {
        const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        if (token) {
          fetch(`${API_BASE}/api/wishlist/${id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
        return updated;
      });
    },
    [token]
  );

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearWishlist = useCallback(() => setWishlistIds([]), []);

  const isInWishlist = useCallback(
    (id: number) => wishlistIds.includes(id),
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: wishlistIds.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

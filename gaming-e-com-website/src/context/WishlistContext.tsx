// WishlistContext.tsx - Persist wishlist product IDs in localStorage
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

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
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => loadIds());

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (id: number) => wishlistIds.includes(id),
    [wishlistIds]
  );

  const toggleWishlist = useCallback((id: number) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearWishlist = useCallback(() => setWishlistIds([]), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

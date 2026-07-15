// WishlistContext.tsx — Server is the ONLY source of truth
// Every mutation (add/remove/clear) goes through the backend first.
// Local state updates ONLY after server confirms success.
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { wishlistService } from "../services/wishlistService";

interface WishlistContextValue { wishlistIds: number[]; isInWishlist: (id: number) => boolean; toggleWishlist: (id: number) => void; removeFromWishlist: (id: number) => void; clearWishlist: () => void; wishlistCount: number }

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
  const { token } = useAuth();

  // Load from server on mount (or token change) — server is source of truth
  useEffect(() => {
    wishlistService.load(token).then(serverIds => {
      if (serverIds.length > 0 || ids.length === 0) setIds(serverIds);
    });
  }, [token]);

  // Cache to localStorage for offline
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  // Toggle: update server first, then local state
  const toggleWishlist = useCallback(async (id: number) => {
    const { added } = await wishlistService.toggle(id);
    // Reload from server to get ground truth
    const serverIds = await wishlistService.load(token);
    setIds(serverIds);
  }, [token]);

  // Remove: goes through server
  const removeFromWishlist = useCallback(async (id: number) => {
    await wishlistService.remove(id);
    const serverIds = await wishlistService.load(token);
    setIds(serverIds);
  }, [token]);

  // Clear: goes through server for every item
  const clearWishlist = useCallback(async () => {
    await wishlistService.clear(ids);
    const serverIds = await wishlistService.load(token);
    setIds(serverIds);
  }, [ids, token]);

  const isInWishlist = useCallback((id: number) => ids.includes(id), [ids]);

  return <WishlistContext.Provider value={{ wishlistIds: ids, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: ids.length }}>{children}</WishlistContext.Provider>;
}

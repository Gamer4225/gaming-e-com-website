// WishlistContext.tsx — Server is source of truth via api.wishlist
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

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

  // On mount (or token change): load from server as source of truth
  useEffect(() => {
    const fetcher = token ? api.wishlist.listMine(token) : api.wishlist.list();
    fetcher.then(data => { if (data?.ids && Array.isArray(data.ids)) setIds(data.ids.filter((n:any) => typeof n === "number")); }).catch(() => {});
  }, [token]);

  // Offline cache
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const toggleWishlist = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      api.wishlist.toggle(id).catch(() => {});
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => setIds(p => p.filter(x => x !== id)), []);
  const clearWishlist = useCallback(() => setIds([]), []);
  const isInWishlist = useCallback((id: number) => ids.includes(id), [ids]);

  return <WishlistContext.Provider value={{ wishlistIds: ids, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount: ids.length }}>{children}</WishlistContext.Provider>;
}

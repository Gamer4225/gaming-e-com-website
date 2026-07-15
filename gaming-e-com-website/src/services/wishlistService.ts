// services/wishlistService.ts — Wishlist: single source of truth on server
// All wishlist mutations go through the backend. Local state mirrors server after each call.
import { api } from "./api";

export const wishlistService = {
  async load(token?: string): Promise<number[]> {
    try {
      const data = token ? await api.wishlist.listMine(token) : await api.wishlist.list();
      return (data?.ids && Array.isArray(data.ids)) ? data.ids.filter((n: any) => typeof n === "number") : [];
    } catch { return []; }
  },

  async toggle(id: number): Promise<{ added: boolean }> {
    try {
      const data = await api.wishlist.toggle(id);
      return { added: data?.added ?? true };
    } catch { return { added: false }; }
  },

  async remove(id: number): Promise<void> {
    await api.wishlist.toggle(id).catch(() => {}); // toggle removes if exists
  },

  async clear(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => api.wishlist.toggle(id).catch(() => {})));
  },
};

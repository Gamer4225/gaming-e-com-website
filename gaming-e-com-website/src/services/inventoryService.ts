// services/inventoryService.ts — Inventory analytics
import { adminFetch } from "../context/AdminContext";

export const inventoryService = {
  stats(token: string) {
    return adminFetch("/api/admin/inventory-stats", token).then(r => r.json());
  },

  updateStock(token: string, url: string, id: number, stock: number) {
    return adminFetch(`${url}/${id}/stock`, token, {
      method: "PATCH", body: JSON.stringify({ stock }),
    });
  },

  // Low stock products (admin only)
  lowStock(token: string) {
    return adminFetch("/api/admin/products?filter=low", token).then(r => r.json());
  },

  // Out of stock products (admin only)
  outOfStock(token: string) {
    return adminFetch("/api/admin/products?filter=out", token).then(r => r.json());
  },
};

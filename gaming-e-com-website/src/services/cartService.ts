// services/cartService.ts — Cart reserve/release operations
import { API_BASE } from "../context/ProductCatalogContext";

export const cartService = {
  reserve(items: { id: number; quantity: number }[]) {
    return fetch(`${API_BASE}/api/cart/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch(() => {}); // fire-and-forget during cart operations
  },

  release(items: { id: number; quantity: number }[]) {
    return fetch(`${API_BASE}/api/cart/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch(() => {});
  },
};

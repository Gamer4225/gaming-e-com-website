// services/productService.ts — Centralized product API operations
// All product-related API calls flow through here.
// Components never call adminFetch directly for products.

import { adminFetch } from "../context/AdminContext";

export interface ProductParams {
  q?: string;
  brand?: string;
  filter?: string;
  category?: string;
}

export interface ProductPayload {
  name: string; brand: string; category: string; price: number;
  originalPrice?: number; discount?: number; condition?: string;
  warranty?: string; rating?: number; stock?: number;
  description: string; image: string; specs?: Record<string, string>;
}

export const productService = {
  // List products (scoped by role via URL)
  list(token: string, url: string, params: ProductParams = {}) {
    const p = new URLSearchParams();
    if (params.q) p.set("q", params.q);
    if (params.brand && params.brand !== "All") p.set("brand", params.brand);
    if (params.filter && params.filter !== "all") p.set("filter", params.filter);
    return adminFetch(url + "?" + p.toString(), token).then(r => r.json());
  },

  // Product stats (admin only)
  stats(token: string) {
    return adminFetch("/api/admin/products-stats", token).then(r => r.json());
  },

  // Brand list
  brands(token: string) {
    return adminFetch("/api/admin/brands", token).then(r => r.json());
  },

  // Category stats
  categories(token: string) {
    return adminFetch("/api/admin/categories", token).then(r => r.json());
  },

  // CRUD
  create(token: string, url: string, data: ProductPayload) {
    return adminFetch(url, token, { method: "POST", body: JSON.stringify(data) });
  },

  update(token: string, url: string, id: number, data: Partial<ProductPayload>) {
    return adminFetch(`${url}/${id}`, token, { method: "PUT", body: JSON.stringify(data) });
  },

  remove(token: string, url: string, id: number) {
    return adminFetch(`${url}/${id}`, token, { method: "DELETE" });
  },

  // Quick actions
  updateStock(token: string, url: string, id: number, stock: number) {
    return adminFetch(`${url}/${id}/stock`, token, { method: "PATCH", body: JSON.stringify({ stock }) });
  },

  toggleFeatured(token: string, id: number) {
    return adminFetch(`/api/admin/products/${id}/feature`, token, { method: "PATCH" });
  },

  reseed(token: string) {
    return adminFetch("/api/admin/reseed", token, { method: "POST" });
  },

  bulkDiscount(token: string, category: string, discount: number) {
    return adminFetch("/api/admin/bulk-discount", token, { method: "POST", body: JSON.stringify({ category, discount }) });
  },
};

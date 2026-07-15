// services/api.ts — SINGLE DATA LAYER for all frontend operations
// Every component calls this. No direct fetch() calls anywhere else.
// Backend is the sole source of truth for products, orders, wishlist, inventory, reviews, coupons, settings.

const BASE = ""; // Vite proxies /api to backend

type Opts = Omit<RequestInit, "body"> & { body?: any };

async function req<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = opts.headers ? { ...opts.headers as Record<string, string> } : {};
  if (opts.body && typeof opts.body !== "string") { opts.body = JSON.stringify(opts.body); headers["Content-Type"] = "application/json"; }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  // ─── AUTH ───
  login: (email: string, password: string) => req<{ token: string; user: any }>("/api/auth/login", { method: "POST", body: { email, password } }),
  signup: (payload: any) => req<{ token: string; user: any }>("/api/auth/signup", { method: "POST", body: payload }),
  me: (token: string) => req<{ user: any }>("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),

  // ─── PRODUCTS ───
  products: {
    list: (params?: string) => req<any[]>(`/api/products${params ? "?" + params : ""}`),
    get: (id: number) => req<any>(`/api/products/${id}`),
    meta: () => req<any>("/api/meta"),
    // Admin
    adminList: (token: string, params?: string) => req<any[]>(`/api/admin/products${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
    adminCreate: (token: string, d: any) => req<any>("/api/admin/products", { method: "POST", body: d, headers: { Authorization: `Bearer ${token}` } }),
    adminUpdate: (token: string, id: number, d: any) => req<any>(`/api/admin/products/${id}`, { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
    adminDelete: (token: string, id: number) => req<any>(`/api/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
    toggleFeature: (token: string, id: number) => req<any>(`/api/admin/products/${id}/feature`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),
    updateStock: (token: string, id: number, stock: number, staffUrl?: string) => {
      const url = staffUrl || "/api/admin/products";
      return req<any>(`${url}/${id}/stock`, { method: "PATCH", body: { stock }, headers: { Authorization: `Bearer ${token}` } });
    },
    reseed: (token: string) => req<any>("/api/admin/reseed", { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
    bulkDiscount: (token: string, category: string, discount: number) => req<any>("/api/admin/bulk-discount", { method: "POST", body: { category, discount }, headers: { Authorization: `Bearer ${token}` } }),
    // Staff
    staffList: (token: string, params?: string) => req<any[]>(`/api/staff/products${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
    staffCreate: (token: string, d: any) => req<any>("/api/staff/products", { method: "POST", body: d, headers: { Authorization: `Bearer ${token}` } }),
    staffUpdate: (token: string, id: number, d: any) => req<any>(`/api/staff/products/${id}`, { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
    staffDelete: (token: string, id: number) => req<any>(`/api/staff/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  },

  // ─── ORDERS ───
  orders: {
    // Customer
    place: (payload: any, token?: string) => req<any>("/api/orders", { method: "POST", body: payload, headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    listPublic: () => req<any[]>("/api/orders"),
    listMine: (token: string) => req<any[]>("/api/my-orders", { headers: { Authorization: `Bearer ${token}` } }),
    // Admin
    adminList: (token: string, params?: string) => req<any[]>(`/api/admin/orders${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
    updateStatus: (token: string, orderId: string, status: string) => req<any>(`/api/admin/orders/${orderId}/status`, { method: "PATCH", body: { status }, headers: { Authorization: `Bearer ${token}` } }),
  },

  // ─── WISHLIST ───
  wishlist: {
    list: () => req<{ ids: number[] }>("/api/wishlist"),
    listMine: (token: string) => req<{ ids: number[] }>("/api/my-wishlist", { headers: { Authorization: `Bearer ${token}` } }),
    toggle: (id: number) => req<any>(`/api/wishlist/${id}`, { method: "POST" }),
    // Admin
    mostWishlisted: (token: string) => req<any[]>("/api/admin/most-wishlisted", { headers: { Authorization: `Bearer ${token}` } }),
  },

  // ─── DASHBOARD ───
  adminStats: (token: string) => req<any>("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
  subAdminStats: (token: string) => req<any>("/api/sub-admin/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
  merchantStats: (token: string) => req<any>("/api/merchant/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
  sellerStats: (token: string) => req<any>("/api/seller/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
  staffStats: (token: string) => req<any>("/api/staff/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
  inventoryStats: (token: string) => req<any>("/api/admin/inventory-stats", { headers: { Authorization: `Bearer ${token}` } }),
  salesReport: (token: string) => req<any>("/api/admin/reports/sales", { headers: { Authorization: `Bearer ${token}` } }),

  // ─── USERS ───
  accounts: (token: string, params?: string) => req<any[]>(`/api/admin/accounts${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
  brands: (token: string) => req<string[]>("/api/admin/brands", { headers: { Authorization: `Bearer ${token}` } }),

  // ─── REVIEWS ───
  reviews: {
    list: (token: string, params?: string) => req<any[]>(`/api/admin/reviews${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
    submit: (payload: any) => req<any>("/api/reviews", { method: "POST", body: payload }),
    getForProduct: (productId: number) => req<any[]>(`/api/reviews/${productId}`),
    updateStatus: (token: string, id: number, status: string) => req<any>(`/api/admin/reviews/${id}/status`, { method: "PATCH", body: { status }, headers: { Authorization: `Bearer ${token}` } }),
    seed: (token: string) => req<any>("/api/admin/reviews/seed", { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
  },

  // ─── COUPONS / SETTINGS / LOGS ───
  coupons: {
    list: (token: string) => req<any[]>("/api/admin/coupons", { headers: { Authorization: `Bearer ${token}` } }),
    create: (token: string, d: any) => req<any>("/api/admin/coupons", { method: "POST", body: d, headers: { Authorization: `Bearer ${token}` } }),
    update: (token: string, id: number, d: any) => req<any>(`/api/admin/coupons/${id}`, { method: "PATCH", body: d, headers: { Authorization: `Bearer ${token}` } }),
    delete: (token: string, id: number) => req<any>(`/api/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  },
  settings: {
    get: (token: string) => req<Record<string, string>>("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } }),
    save: (token: string, d: Record<string, string>) => req<any>("/api/admin/settings", { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
  },
  logs: {
    list: (token: string, params?: string) => req<any[]>(`/api/admin/activity-logs${params ? "?" + params : ""}`, { headers: { Authorization: `Bearer ${token}` } }),
  },
  inventory: {
    stats: (token: string) => req<any>("/api/admin/inventory-stats", { headers: { Authorization: `Bearer ${token}` } }),
  },
  categories: {
    list: (token: string) => req<any[]>("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } }),
  },
  password: {
    change: (token: string, d: any) => req<any>("/api/admin/change-password", { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
    customerChange: (token: string, d: any) => req<any>("/api/customer/change-password", { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
  },
  profile: {
    update: (token: string, d: any) => req<any>("/api/customer/profile", { method: "PUT", body: d, headers: { Authorization: `Bearer ${token}` } }),
  },
  mostOrdered: (token: string) => req<any[]>("/api/admin/most-ordered", { headers: { Authorization: `Bearer ${token}` } }),
};

// services/orderService.ts — Centralized order API operations
import { adminFetch } from "../context/AdminContext";

export const orderService = {
  list(token: string, status?: string) {
    const p = new URLSearchParams();
    if (status && status !== "All") p.set("status", status);
    return adminFetch("/api/admin/orders?" + p.toString(), token).then(r => r.json());
  },

  updateStatus(token: string, orderId: string, status: string) {
    return adminFetch(`/api/admin/orders/${orderId}/status`, token, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
  },

  get(token: string, orderId: string) {
    return adminFetch(`/api/orders/${orderId}`, token).then(r => r.json());
  },
};

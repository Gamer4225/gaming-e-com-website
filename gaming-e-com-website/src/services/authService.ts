// services/authService.ts — Centralized auth operations
import { adminFetch } from "../context/AdminContext";

export const authService = {
  me(token: string) {
    return adminFetch("/api/auth/me", token).then(r => r.json());
  },

  changePassword(token: string, currentPassword: string, newPassword: string) {
    return adminFetch("/api/admin/change-password", token, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
  },

  customerProfile(token: string, name: string, phone: string) {
    return adminFetch("/api/customer/profile", token, { method: "PUT", body: JSON.stringify({ name, phone }) });
  },

  customerChangePassword(token: string, currentPassword: string, newPassword: string) {
    return adminFetch("/api/customer/change-password", token, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
  },
};

// config/adminRouteConfig.ts — Centralized admin navigation
// Add new admin pages here, not scattered across App.tsx.
import type { Permissions } from "../context/PermissionContext";

export interface AdminRoute { id: string; label: string; icon: string; permission: keyof Permissions }

const ALL_ROUTES: AdminRoute[] = [
  { id: "admin-products", label: "Products", icon: "📦", permission: "canViewAllProducts" },
  { id: "admin-categories", label: "Categories", icon: "🏷️", permission: "canViewCategories" },
  { id: "admin-brands", label: "Brands", icon: "🏷️", permission: "canViewAllProducts" },
  { id: "admin-orders", label: "Orders", icon: "📋", permission: "canViewAllOrders" },
  { id: "admin-accounts", label: "Accounts", icon: "👥", permission: "canViewAccounts" },
  { id: "admin-ordered", label: "Most Ordered", icon: "🔥", permission: "canViewMostOrdered" },
  { id: "admin-wishlisted", label: "Wishlist Analytics", icon: "💜", permission: "canViewMostWishlisted" },
  { id: "admin-reviews", label: "Reviews", icon: "⭐", permission: "canManageReviews" },
  { id: "admin-coupons", label: "Coupons", icon: "🎫", permission: "canManageCoupons" },
  { id: "admin-reports", label: "Reports", icon: "📈", permission: "canViewReports" },
  { id: "admin-logs", label: "Activity Logs", icon: "📝", permission: "canViewActivityLogs" },
  { id: "admin-settings", label: "Settings", icon: "⚙️", permission: "canManageSettings" },
  { id: "admin-password", label: "Change Password", icon: "🔑", permission: "canManageSettings" },
];

const LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  merchant: { "Products": "My Products" },
  seller: { "Products": "My Listings" },
};

export function getAdminTabs(perms: Permissions, role: string): { id: string; label: string; icon: string }[] {
  return ALL_ROUTES
    .filter(r => (perms as any)[r.permission])
    .map(r => ({
      id: r.id,
      label: (LABEL_OVERRIDES[role] && LABEL_OVERRIDES[role][r.label]) || r.label,
      icon: r.icon,
    }));
}

export { ALL_ROUTES };

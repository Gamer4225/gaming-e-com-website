// PermissionContext.tsx — Centralized role-based permissions
// Single source of truth for what each role can do

export type Role = "admin" | "sub-admin" | "merchant" | "seller" | "customer";

export interface Permissions {
  // Products
  canViewAllProducts: boolean;
  canAddProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canFeatureProduct: boolean;
  canExportProducts: boolean;
  canReseedProducts: boolean;
  canEditStock: boolean;

  // Orders
  canViewAllOrders: boolean;
  canUpdateOrderStatus: boolean;

  // Users
  canViewAllUsers: boolean;
  canViewAccounts: boolean;
  canCreateAccounts: boolean;

  // Analytics
  canViewMostOrdered: boolean;
  canViewMostWishlisted: boolean;
  canViewReports: boolean;
  canViewActivityLogs: boolean;

  // Store
  canViewCategories: boolean;
  canManageCoupons: boolean;
  canManageReviews: boolean;
  canManageSettings: boolean;
  canBulkDiscount: boolean;

  // Purchasing
  canPurchase: boolean;
  canCart: boolean;
  canWishlist: boolean;

  // Dashboard type
  dashboardPage: string;
  panelLabel: string;
}

export function getPermissions(role: Role, brand?: string): Permissions {
  const base: Permissions = {
    canViewAllProducts: false, canAddProduct: false, canEditProduct: false,
    canDeleteProduct: false, canFeatureProduct: false, canExportProducts: false,
    canReseedProducts: false, canEditStock: false,
    canViewAllOrders: false, canUpdateOrderStatus: false,
    canViewAllUsers: false, canViewAccounts: false, canCreateAccounts: false,
    canViewMostOrdered: false, canViewMostWishlisted: false,
    canViewReports: false, canViewActivityLogs: false,
    canViewCategories: false, canManageCoupons: false, canManageReviews: false,
    canManageSettings: false, canBulkDiscount: false,
    canPurchase: false, canCart: false, canWishlist: false,
    dashboardPage: "", panelLabel: "",
  };

  switch (role) {
    case "admin":
      return {
        ...base,
        canViewAllProducts:true, canAddProduct:true, canEditProduct:true, canDeleteProduct:true,
        canFeatureProduct:true, canExportProducts:true, canReseedProducts:true, canEditStock:true,
        canViewAllOrders:true, canUpdateOrderStatus:true,
        canViewAllUsers:true, canViewAccounts:true, canCreateAccounts:true,
        canViewMostOrdered:true, canViewMostWishlisted:true,
        canViewReports:true, canViewActivityLogs:true,
        canViewCategories:true, canManageCoupons:true, canManageReviews:true,
        canManageSettings:true, canBulkDiscount:true,
        canPurchase:false, canCart:false, canWishlist:false,
        dashboardPage: "admin-dashboard", panelLabel: "Admin",
      };

    case "sub-admin":
      return {
        ...base,
        canViewAllProducts:true, canAddProduct:true, canEditProduct:true, canDeleteProduct:true,
        canFeatureProduct:true, canExportProducts:true, canEditStock:true,
        canViewAllOrders:true, canUpdateOrderStatus:true,
        canViewMostOrdered:true, canViewMostWishlisted:true,
        canViewReports:true, canViewActivityLogs:false,
        canViewCategories:true, canManageReviews:true,
        canPurchase:false, canCart:false, canWishlist:false,
        dashboardPage: "sub-dashboard", panelLabel: "Sub-Admin",
      };

    case "merchant":
      return {
        ...base,
        canViewAllProducts:false, canAddProduct:true, canEditProduct:true, canDeleteProduct:true,
        canEditStock:true,
        canViewMostOrdered:true,
        canPurchase:false, canCart:false, canWishlist:false,
        dashboardPage: "merchant-dashboard", panelLabel: "Merchant",
      };

    case "seller":
      return {
        ...base,
        canAddProduct:true, canEditProduct:true, canDeleteProduct:true, canEditStock:true,
        canPurchase:true, canCart:true, canWishlist:true,
        dashboardPage: "seller-dashboard", panelLabel: "Seller",
      };

    case "customer":
      return {
        ...base,
        canPurchase:true, canCart:true, canWishlist:true,
        dashboardPage: "home", panelLabel: "Customer",
      };

    default:
      return base;
  }
}

export function isStaffRole(role: string): boolean {
  return ["admin", "sub-admin", "merchant", "seller"].includes(role);
}

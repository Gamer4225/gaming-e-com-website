// AdminContext.tsx — shared helpers for admin pages
import { API_BASE } from "./ProductCatalogContext";

export function adminFetch(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

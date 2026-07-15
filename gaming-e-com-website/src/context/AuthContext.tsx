// AuthContext.tsx — Simple auth: no persistence, fresh start every page load
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { API_BASE } from "./ProductCatalogContext";

export interface AuthUser { id: number; name: string; email: string; phone?: string; role: string; brand?: string; createdAt?: string }

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone?: string; password: string; role?: string; brand?: string }) => Promise<any>;
  logout: () => void;
  authHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      setToken(data.token);
      setUser(data.user);
      if (data.user.role === "admin") localStorage.removeItem("gamevault_cart");
    } finally { setLoading(false); }
  }, []);

  const signup = useCallback(async (payload: { name: string; email: string; phone?: string; password: string; role?: string; brand?: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  const authHeader = useCallback(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

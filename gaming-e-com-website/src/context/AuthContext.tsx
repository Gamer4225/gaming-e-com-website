// AuthContext.tsx — login / signup with backend SQLite users table
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE } from "./ProductCatalogContext";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  brand?: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  authHeader: () => Record<string, string>;
  loginJustNow: boolean;
  clearLoginJustNow: () => void;
}

const TOKEN_KEY = "gamevault_token";
const USER_KEY = "gamevault_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginJustNow, setLoginJustNow] = useState(false);

  const persist = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    // Clear cart if logging in as admin (admins cannot purchase)
    if (nextUser.role === "admin") {
      localStorage.removeItem("gamevault_cart");
    }
  };

  const clearLoginJustNow = useCallback(() => setLoginJustNow(false), []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setLoginJustNow(false);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");
    persist(data.token, data.user);
    setLoginJustNow(true);
    return data.user;
  }, []);

  const signup = useCallback(
    async (payload: { name: string; email: string; phone?: string; password: string; role?: string; brand?: string }) => {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      persist(data.token, data.user);
      setLoginJustNow(true);
      return data.user;
    },
    []
  );

  const authHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, authHeader, loginJustNow, clearLoginJustNow }}
    >
      {children}
    </AuthContext.Provider>
  );
}

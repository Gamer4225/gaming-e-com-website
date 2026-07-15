// context/OrderContext.tsx — Single source of truth for orders
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

export interface OrderItem { id: number; name: string; brand: string; image: string; price: number; originalPrice: number; quantity: number; condition: string }
export interface PlacedOrder {
  orderId: string; status: string; paymentMethod: string; subtotal: number; gstAmount: number;
  totalSavings: number; grandTotal: number; itemCount: number; placedAt: string;
  estimatedDelivery: string; address: any; items: OrderItem[];
}

interface OrderContextValue {
  orders: PlacedOrder[];
  lastOrder: PlacedOrder | null;
  loading: boolean;
  refreshOrders: () => void;
  clearLastOrder: () => void;
  setLastOrder: (o: PlacedOrder) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = token ? await api.orders.listMine(token) : await api.orders.listPublic();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { refreshOrders(); }, [refreshOrders]);

  const clearLastOrder = useCallback(() => setLastOrder(null), []);

  return (
    <OrderContext.Provider value={{ orders, lastOrder, loading, refreshOrders, clearLastOrder, setLastOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

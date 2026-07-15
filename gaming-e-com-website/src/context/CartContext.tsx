// CartContext.tsx - Cart + checkout
// Stock is NOT reduced when adding to cart.
// Stock decreases only after successful payment via the backend API.
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { type Product } from "./ProductDetailContext";
import { useProductCatalog, API_BASE } from "./ProductCatalogContext";

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentMethod = "cod" | "upi" | "card";

export interface OrderItem {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  condition: string;
}

export interface PlacedOrder {
  orderId: string;
  items: OrderItem[];
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  gstAmount: number;
  totalSavings: number;
  grandTotal: number;
  itemCount: number;
  placedAt: string;
  estimatedDelivery: string;
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  increaseQuantity: (id: number, isPreOwned?: boolean) => void;
  decreaseQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  /** Remaining units that can still be added to cart (catalog stock − cart qty) */
  getRemainingToAdd: (product: Product) => number;
  /** True only when catalog stock is 0 (after purchase / real inventory) */
  isSoldOut: (product: Product) => boolean;
  totalItems: number;
  totalPrice: number;
  toast: string | null;
  lastOrder: PlacedOrder | null;
  orderHistory: PlacedOrder[];
  placeOrder: (
    address: ShippingAddress,
    paymentMethod: PaymentMethod
  ) => Promise<PlacedOrder | null>;
  clearOrderHistory: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

const CART_STORAGE_KEY = "gamevault_cart";
const LAST_ORDER_KEY = "gamevault_last_order";
const ORDER_HISTORY_KEY = "gamevault_order_history";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function maxQtyForProduct(product: Product): number {
  if (product.condition === "Pre-Owned") return product.stock > 0 ? 1 : 0;
  return Math.max(0, product.stock);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { applyStockUpdates, getProductById, products } = useProductCatalog();

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadJSON<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(() =>
    loadJSON<PlacedOrder | null>(LAST_ORDER_KEY, null)
  );
  const [orderHistory, setOrderHistory] = useState<PlacedOrder[]>(() =>
    loadJSON<PlacedOrder[]>(ORDER_HISTORY_KEY, [])
  );
  const [toast, setToast] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);
  const toggleCartDrawer = useCallback(() => setIsCartDrawerOpen((v) => !v), []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (lastOrder) {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(lastOrder));
    }
  }, [lastOrder]);

  useEffect(() => {
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory));
  }, [orderHistory]);

  // After catalog stock changes (e.g. order paid), clamp/remove cart lines
  useEffect(() => {
    if (!products.length) return;
    setCartItems((prev) => {
      if (!prev.length) return prev;
      let changed = false;
      const next = prev
        .map((item) => {
          const fresh = products.find((p) => p.id === item.id);
          if (!fresh) return item;
          if (fresh.stock <= 0) {
            changed = true;
            return null;
          }
          const max = maxQtyForProduct(fresh);
          const quantity = Math.min(item.quantity, max);
          if (
            quantity !== item.quantity ||
            fresh.stock !== item.stock ||
            fresh.price !== item.price
          ) {
            changed = true;
          }
          return { ...item, ...fresh, quantity };
        })
        .filter(Boolean) as CartItem[];
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const isSoldOut = useCallback((product: Product) => {
    const live = getProductById(product.id) || product;
    return live.stock <= 0;
  }, [getProductById]);

  // How many more units can still be added (does NOT mark sold out when 0 remaining to add)
  const getRemainingToAdd = useCallback(
    (product: Product): number => {
      const live = getProductById(product.id) || product;
      const max = maxQtyForProduct(live);
      const inCart = cartItems.find((i) => i.id === live.id)?.quantity ?? 0;
      return Math.max(0, max - inCart);
    },
    [cartItems, getProductById]
  );

  const addToCart = useCallback(
    (product: Product, qty: number = 1) => {
      const live = getProductById(product.id) || product;
      if (live.stock <= 0) {
        showToast(`${live.name} is sold out`);
        return;
      }

      const max = maxQtyForProduct(live);
      if (max <= 0) {
        showToast(`${live.name} is sold out`);
        return;
      }

      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === live.id);
        if (existing) {
          if (live.condition === "Pre-Owned") {
            showToast(`${live.name} is already in cart — pre-owned items are unique!`);
            return prev;
          }
          if (existing.quantity >= max) {
            showToast(`Only ${max} unit${max > 1 ? "s" : ""} available for ${live.name}`);
            return prev;
          }
          const clamped = Math.min(existing.quantity + qty, max);
          const added = clamped - existing.quantity;
          if (added <= 0) {
            showToast(`Only ${max} unit${max > 1 ? "s" : ""} available for ${live.name}`);
            return prev;
          }
          showToast(`${live.name}${added > 1 ? ` × ${added}` : ""} added to cart!`);
          return prev.map((item) =>
            item.id === live.id ? { ...live, quantity: clamped } : item
          );
        }

        const initialQty =
          live.condition === "Pre-Owned" ? 1 : Math.min(Math.max(1, qty), max);
        showToast(`${live.name}${initialQty > 1 ? ` × ${initialQty}` : ""} added to cart!`);
        // Do NOT reduce catalog stock here — only reserve in cart
        return [...prev, { ...live, quantity: initialQty }];
      });
    },
    [getProductById, showToast]
  );

  const increaseQuantity = useCallback(
    (id: number, isPreOwned?: boolean) => {
      if (isPreOwned) return;
      setCartItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        const live = getProductById(id) || item;
        const max = maxQtyForProduct(live);
        if (item.quantity >= max) {
          showToast(`Only ${max} unit${max > 1 ? "s" : ""} available for ${item.name}`);
          return prev;
        }
        return prev.map((i) =>
          i.id === id ? { ...i, ...live, quantity: i.quantity + 1 } : i
        );
      });
    },
    [getProductById, showToast]
  );

  const decreaseQuantity = useCallback((id: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const placeOrder = useCallback(
    async (
      address: ShippingAddress,
      paymentMethod: PaymentMethod
    ): Promise<PlacedOrder | null> => {
      if (cartItems.length === 0) return null;

      const payload = {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        address,
        paymentMethod,
      };

      try {
        const res = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data?.error || "Order failed");
          return null;
        }

        // Stock reduced on server after payment — sync UI
        if (Array.isArray(data.updatedStocks)) {
          applyStockUpdates(data.updatedStocks);
        }

        const order: PlacedOrder = {
          orderId: data.orderId,
          items: data.items,
          address: data.address,
          paymentMethod: data.paymentMethod,
          subtotal: data.subtotal,
          gstAmount: data.gstAmount,
          totalSavings: data.totalSavings,
          grandTotal: data.grandTotal,
          itemCount: data.itemCount,
          placedAt: data.placedAt,
          estimatedDelivery: data.estimatedDelivery,
        };

        setLastOrder(order);
        setOrderHistory((prev) => [order, ...prev].slice(0, 20));
        setCartItems([]);
        showToast("Order placed successfully!");
        return order;
      } catch {
        // Offline fallback: local order only (no real stock DB update)
        showToast("Server offline — placing local demo order");
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const gstAmount = Math.round(subtotal * 0.18);
        const totalSavings = cartItems.reduce(
          (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
          0
        );
        const grandTotal = subtotal + gstAmount;
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const delivery = new Date();
        delivery.setDate(delivery.getDate() + 3 + Math.floor(Math.random() * 3));
        const order: PlacedOrder = {
          orderId: `GV-LOCAL-${Date.now().toString(36).toUpperCase()}`,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            condition: item.condition,
          })),
          address,
          paymentMethod,
          subtotal,
          gstAmount,
          totalSavings,
          grandTotal,
          itemCount,
          placedAt: new Date().toISOString(),
          estimatedDelivery: delivery.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
        // Simulate stock drop locally only after "payment"
        applyStockUpdates(
          cartItems.map((item) => ({
            id: item.id,
            stock: Math.max(0, item.stock - item.quantity),
          }))
        );
        setLastOrder(order);
        setOrderHistory((prev) => [order, ...prev].slice(0, 20));
        setCartItems([]);
        return order;
      }
    },
    [cartItems, applyStockUpdates, showToast]
  );

  const clearOrderHistory = useCallback(() => {
    setOrderHistory([]);
    setLastOrder(null);
    localStorage.removeItem(ORDER_HISTORY_KEY);
    localStorage.removeItem(LAST_ORDER_KEY);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getRemainingToAdd,
        isSoldOut,
        totalItems,
        totalPrice,
        toast,
        lastOrder,
        orderHistory,
        placeOrder,
        clearOrderHistory,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

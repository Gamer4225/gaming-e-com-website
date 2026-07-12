// CartContext.tsx - Global cart state with pre-owned limits, sold tracking, and bulk add support
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Product } from "./ProductDetailContext";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  soldPreOwnedIds: number[];
  addToCart: (product: Product, qty?: number) => void;
  increaseQuantity: (id: number, isPreOwned?: boolean) => void;
  decreaseQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  toast: string | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [soldPreOwnedIds, setSoldPreOwnedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Add a product to the cart with optional quantity (default 1)
  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Pre-owned items: max quantity of 1 (they are unique)
        if (product.condition === "Pre-Owned") {
          showToast(`${product.name} is already in cart — pre-owned items are unique!`);
          return prev;
        }
        // Existing new item: add the requested quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      // New item not in cart: add with requested quantity
      if (product.condition === "Pre-Owned") {
        setSoldPreOwnedIds((prev) => [...prev, product.id]);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    showToast(`${product.name}${qty > 1 ? ` × ${qty}` : ""} added to cart!`);
  }, [showToast]);

  // Increase quantity — block for pre-owned items
  const increaseQuantity = useCallback((id: number, isPreOwned?: boolean) => {
    if (isPreOwned) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  // Decrease quantity (remove if it reaches 0)
  const decreaseQuantity = useCallback((id: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      const wasPreOwned = item?.condition === "Pre-Owned";
      return prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => {
          if (item.quantity <= 0 && wasPreOwned) {
            setSoldPreOwnedIds((s) => s.filter((sid) => sid !== id));
          }
          return item.quantity > 0;
        });
    });
  }, []);

  // Remove an item from the cart entirely
  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.condition === "Pre-Owned") {
        setSoldPreOwnedIds((prev) => prev.filter((sid) => sid !== id));
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // Clear all items
  const clearCart = useCallback(() => {
    setCartItems([]);
    setSoldPreOwnedIds([]);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems, soldPreOwnedIds,
        addToCart, increaseQuantity, decreaseQuantity,
        removeFromCart, clearCart,
        totalItems, totalPrice, toast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

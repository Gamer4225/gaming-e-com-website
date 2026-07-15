// context/NotificationContext.tsx — Customer order status notifications
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface Notification { id: string; orderId: string; message: string; type: string; createdAt: string; read: boolean }

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (orderId: string, message: string, type: string) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const KEY = "gamevault_notifications";
const Context = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

function load(): Notification[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => load());

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notifications.slice(0, 100))); }, [notifications]);

  const addNotification = useCallback((orderId: string, message: string, type: string) => {
    setNotifications(prev => [{
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      orderId, message, type, createdAt: new Date().toISOString(), read: false
    }, ...prev].slice(0, 100));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return <Context.Provider value={{ notifications, unreadCount, addNotification, markRead, clearAll }}>{children}</Context.Provider>;
}

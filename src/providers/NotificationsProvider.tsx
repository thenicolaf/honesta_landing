"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toastInfo } from "@/shared/ui";
import type { Notification } from "@/lib/notificationsDb";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationsProvider>",
    );
  return ctx;
}

interface NotificationsProviderProps {
  children: React.ReactNode;
  role?: string | null;
  userId?: string;
  allowNotifications?: boolean;
}

export function NotificationsProvider({
  children,
  role = null,
  userId,
  allowNotifications = true,
}: NotificationsProviderProps) {
  const active = !!role && !!userId;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(active);
  const supabaseRef = useRef(createSupabaseBrowserClient());

  const fetchNotifications = useCallback(async () => {
    if (!active) return;
    try {
      const res = await fetch("/api/notifications?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      const all: Notification[] = data.notifications;
      if (allowNotifications) {
        setNotifications(all);
        setUnreadCount(data.unreadCount);
      } else {
        const personal = all.filter((n) => n.user_id !== null);
        setNotifications(personal);
        setUnreadCount(personal.filter((n) => !n.is_read).length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [active]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!active) return;
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification;

          // Client-side filter: only show notifications meant for this user
          // audience === null means "all roles"
          const isBroadcast = n.user_id === null;
          const isForMe =
            n.user_id === userId ||
            (isBroadcast &&
              (n.audience === null || n.audience === role));

          if (!isForMe) return;
          if (isBroadcast && !allowNotifications) return;

          setNotifications((prev) => [{ ...n, is_read: false }, ...prev]);
          setUnreadCount((prev) => prev + 1);

          const message = n.message
            ? `${n.title}: ${n.message}`
            : n.title;
          toastInfo(message);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [active, role, userId]);

  const markAsRead = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

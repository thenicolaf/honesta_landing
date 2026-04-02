"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toastInfo } from "@/shared/ui";
import type { Notification } from "@/lib/notificationsDb";

function filterByPermissions(
  all: Notification[],
  allowNotifications: boolean,
): { notifications: Notification[]; unreadCount: number } {
  if (allowNotifications) {
    return { notifications: all, unreadCount: all.filter((n) => !n.is_read).length };
  }
  const personal = all.filter((n) => n.user_id !== null);
  return { notifications: personal, unreadCount: personal.filter((n) => !n.is_read).length };
}

function isNotificationForUser(
  n: Notification,
  userId: string | undefined,
  role: string | null,
  allowNotifications: boolean,
): boolean {
  const isBroadcast = n.user_id === null;
  const isForMe =
    n.user_id === userId ||
    (isBroadcast && (n.audience === null || n.audience === role));

  if (!isForMe) return false;
  if (isBroadcast && !allowNotifications) return false;
  return true;
}

function formatNotificationMessage(n: Notification): string {
  return n.message ? `${n.title}: ${n.message}` : n.title;
}

async function patchNotifications(body: Record<string, unknown>): Promise<void> {
  await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function useRealtimeNotifications(
  active: boolean,
  role: string | null,
  userId: string | undefined,
  allowNotifications: boolean,
) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(active);
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const allowRef = useRef(allowNotifications);
  allowRef.current = allowNotifications;

  const fetchNotifications = useCallback(async () => {
    if (!active) return;
    try {
      const res = await fetch("/api/notifications?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      const filtered = filterByPermissions(data.notifications, allowNotifications);
      setNotifications(filtered.notifications);
      setUnreadCount(allowNotifications ? data.unreadCount : filtered.unreadCount);
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
          if (!isNotificationForUser(n, userId, role, allowRef.current)) return;

          setNotifications((prev) => [{ ...n, is_read: false }, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toastInfo(formatNotificationMessage(n));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [active, role, userId]);

  const markAsRead = useCallback(async (id: string) => {
    await patchNotifications({ id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await patchNotifications({ all: true });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}

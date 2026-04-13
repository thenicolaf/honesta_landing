"use client";

import { createContext, useContext, useState } from "react";
import { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";
import { useServiceWorker } from "./hooks/useServiceWorker";
import type {
  NotificationsContextValue,
  NotificationsProviderProps,
  PushState,
} from "./types";

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

export function NotificationsProvider({
  children,
  role = null,
  userId,
  allowNotifications = true,
  initialUnreadCount = 0,
}: NotificationsProviderProps) {
  const active = !!role && !!userId;
  const [pushState, setPushState] = useState<PushState>("unsupported");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useRealtimeNotifications(active, role, userId, allowNotifications, initialUnreadCount);

  const { subscribeToPush, unsubscribeFromPush } = useServiceWorker(
    active,
    setPushState,
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh,
        pushState,
        subscribeToPush,
        unsubscribeFromPush,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

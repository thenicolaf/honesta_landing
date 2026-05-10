"use client";

import { createContext, useContext, useState } from "react";
import { useNotificationsBackgroundPolling } from "./hooks/useNotificationsBackgroundPolling";
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
  const [pushState, setPushState] = useState<PushState>("unsupported");

  const { unreadCount, markAsRead, markAllAsRead, refresh } =
    useNotificationsBackgroundPolling({
      role,
      userId,
      allowNotifications,
      initialUnreadCount,
    });

  const active = !!role && !!userId;
  const { subscribeToPush, unsubscribeFromPush } = useServiceWorker(
    active,
    setPushState,
  );

  return (
    <NotificationsContext.Provider
      value={{
        userId,
        role,
        allowNotifications,
        unreadCount,
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

"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../queryKeys";
import { useApplySinceResults } from "./useApplySinceResults";
import { useMarkReadMutations } from "./useMarkReadMutations";
import { useNotificationsSinceQuery } from "./useNotificationsSinceQuery";
import { useToastDeduplicator } from "./useToastDeduplicator";
import { useUnreadCountCache } from "./useUnreadCountCache";

interface Args {
  role: string | null;
  userId: string | undefined;
  allowNotifications: boolean;
  initialUnreadCount: number;
}

/**
 * Provider-level orchestrator. Composes the focused sub-hooks that own each
 * concern: unread counter cache, since-poll query, side-effect bridge, toast
 * deduplication, mark-as-read mutations. Returns the small surface area the
 * `<NotificationsProvider>` exposes through context.
 */
export function useNotificationsBackgroundPolling({
  role,
  userId,
  allowNotifications,
  initialUnreadCount,
}: Args) {
  const active = !!role && !!userId;
  const queryClient = useQueryClient();

  const unreadCount = useUnreadCountCache(userId, active, initialUnreadCount);
  const tryToast = useToastDeduplicator();
  const sinceQuery = useNotificationsSinceQuery(userId, active);

  useApplySinceResults({
    data: sinceQuery.data,
    role,
    userId,
    allowNotifications,
    tryToast,
  });

  const { markAsRead, markAllAsRead } = useMarkReadMutations(userId);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: notificationKeys.list(userId),
    });
  }, [queryClient, userId]);

  return { unreadCount, markAsRead, markAllAsRead, refresh };
}

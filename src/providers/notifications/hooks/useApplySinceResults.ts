"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/lib/notificationsDb";
import { isNotificationForUser, type NotificationsListData } from "../filters";
import { notificationKeys } from "../queryKeys";
import type { SinceResponse } from "./useNotificationsSinceQuery";

interface Args {
  data: SinceResponse | undefined;
  role: string | null;
  userId: string | undefined;
  allowNotifications: boolean;
  tryToast: (n: Notification) => void;
}

/**
 * Bridges `useNotificationsSinceQuery` data into the rest of the app:
 * - fires `tryToast` for each new notification visible to this user,
 * - prepends new items to the shared `notificationKeys.list(userId)` cache so
 *   any mounted `useNotificationsList` consumer (NotificationBell,
 *   RecentNotifications) sees them instantly,
 * - writes the authoritative server `unreadCount` into
 *   `notificationKeys.unread(userId)` so the navbar badge updates.
 *
 * This is the canonical TanStack Query v5 pattern for side effects on query
 * data — `onSuccess` was removed in v5; `useEffect` on `query.data` is the
 * official replacement.
 */
export function useApplySinceResults({
  data,
  role,
  userId,
  allowNotifications,
  tryToast,
}: Args) {
  const queryClient = useQueryClient();

  // Ref so the effect's deps stay narrow — `allowNotifications` flipping
  // shouldn't re-run the effect for every since-poll, only on the next one.
  const allowRef = useRef(allowNotifications);
  useEffect(() => {
    allowRef.current = allowNotifications;
  }, [allowNotifications]);

  useEffect(() => {
    if (!data) return;

    const allowed = data.notifications.filter((n) =>
      isNotificationForUser(n, userId, role, allowRef.current),
    );

    if (allowed.length > 0) {
      allowed.forEach(tryToast);
      queryClient.setQueryData<NotificationsListData>(
        notificationKeys.list(userId),
        (old) => {
          if (!old) return old;
          const known = new Set(old.notifications.map((p) => p.id));
          const added = allowed.filter((n) => !known.has(n.id));
          if (added.length === 0) return old;
          return {
            notifications: [
              ...added.map((n) => ({ ...n, is_read: false })),
              ...old.notifications,
            ],
            unreadCount: old.unreadCount + added.length,
          };
        },
      );
    }

    const next = allowRef.current
      ? data.unreadCount
      : data.notifications.filter((n) => n.user_id !== null && !n.is_read).length;
    queryClient.setQueryData<number>(notificationKeys.unread(userId), next);
  }, [data, role, userId, tryToast, queryClient]);
}

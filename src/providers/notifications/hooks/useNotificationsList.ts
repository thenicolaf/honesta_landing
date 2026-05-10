"use client";

import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME_MS } from "../../ReactQueryProvider";
import {
  filterByPermissions,
  type NotificationsListData,
} from "../filters";
import { notificationKeys } from "../queryKeys";
import { useNotifications } from "../NotificationsProvider";

const LIST_LIMIT = 100;

// Re-export for backwards compatibility with existing imports.
export type { NotificationsListData };

/**
 * Lazy-fetches the full notifications list. Multiple consumers (NotificationBell
 * dropdown, RecentNotifications on /panel) share the same query key, so
 * TanStack Query handles ref-counting and HTTP deduplication automatically.
 *
 * Returns the standard `useQuery` result; `data` is filtered by the user's
 * `allowNotifications` preference via `select` (memoised by TQ).
 */
export function useNotificationsList() {
  const { userId, allowNotifications } = useNotifications();

  return useQuery<NotificationsListData, Error, NotificationsListData>({
    queryKey: notificationKeys.list(userId),
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${LIST_LIMIT}`);
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME_MS,
    select: (data) => filterByPermissions(data, allowNotifications),
  });
}

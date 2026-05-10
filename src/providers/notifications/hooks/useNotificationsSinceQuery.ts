"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@/lib/notificationsDb";
import { DEFAULT_STALE_TIME_MS } from "../../ReactQueryProvider";
import { notificationKeys } from "../queryKeys";

const SINCE_LIMIT = 20;

export interface SinceResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Polls `/api/notifications?since=<iso>` every 60 seconds plus on window focus
 * and network reconnect (TanStack Query built-ins). The `since` anchor is
 * stored in a ref (NOT in queryKey, so the cache entry is stable) and advances
 * after every successful response.
 *
 * Pure data-fetcher — side effects (toast, cache merge, unread count update)
 * are handled by `useApplySinceResults`.
 */
export function useNotificationsSinceQuery(
  userId: string | undefined,
  active: boolean,
) {
  const sinceRef = useRef<string>(new Date().toISOString());

  return useQuery<SinceResponse>({
    queryKey: notificationKeys.since(userId),
    queryFn: async () => {
      const res = await fetch(
        `/api/notifications?since=${encodeURIComponent(sinceRef.current)}&limit=${SINCE_LIMIT}`,
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = (await res.json()) as SinceResponse;
      if (data.notifications[0]) sinceRef.current = data.notifications[0].created_at;
      return data;
    },
    enabled: active,
    refetchInterval: DEFAULT_STALE_TIME_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

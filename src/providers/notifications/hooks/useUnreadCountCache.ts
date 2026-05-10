"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "../queryKeys";

/**
 * Holds the unread-notifications counter in TanStack Query cache.
 *
 * Implementation detail: `initialData` makes the data available synchronously
 * on first render, and `staleTime: Infinity` + `refetchOn*: false` mean
 * `queryFn` never actually runs. The counter is then mutated via
 * `queryClient.setQueryData(notificationKeys.unread(userId), ...)` from the
 * since-poll side-effect and from mark-as-read mutations.
 *
 * Storing it in cache (instead of `useState`) lets us update from inside a
 * `useEffect` without triggering React-Compiler's "setState in effect" rule.
 */
export function useUnreadCountCache(
  userId: string | undefined,
  active: boolean,
  initialUnreadCount: number,
) {
  const { data } = useQuery<number>({
    queryKey: notificationKeys.unread(userId),
    queryFn: () => initialUnreadCount,
    enabled: active,
    initialData: initialUnreadCount,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  return data;
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationsListData } from "../filters";
import { notificationKeys } from "../queryKeys";

interface MarkContext {
  prevList: NotificationsListData | undefined;
  prevUnread: number | undefined;
}

async function patchNotifications(body: Record<string, unknown>): Promise<void> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update notification");
}

/**
 * Pair of mutations for marking notifications as read. Both use optimistic
 * updates with snapshot-and-restore on error:
 *
 * 1. `onMutate` cancels in-flight list queries, snapshots `prevList` /
 *    `prevUnread` from cache, and writes the optimistic state.
 * 2. If the PATCH request fails, `onError` restores both snapshots.
 *
 * Returns `mutateAsync` for each mutation, ready to plug into the context
 * value (TanStack Query guarantees `mutateAsync` references are stable).
 */
export function useMarkReadMutations(userId: string | undefined) {
  const queryClient = useQueryClient();
  const listKey = notificationKeys.list(userId);
  const unreadKey = notificationKeys.unread(userId);

  const snapshot = (): MarkContext => ({
    prevList: queryClient.getQueryData<NotificationsListData>(listKey),
    prevUnread: queryClient.getQueryData<number>(unreadKey),
  });

  const restore = (ctx: MarkContext) => {
    queryClient.setQueryData(listKey, ctx.prevList);
    queryClient.setQueryData(unreadKey, ctx.prevUnread);
  };

  const markRead = useMutation<void, Error, string, MarkContext>({
    mutationFn: (id) => patchNotifications({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const prev = snapshot();
      queryClient.setQueryData<NotificationsListData>(listKey, (old) =>
        old
          ? {
              notifications: old.notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n,
              ),
              unreadCount: Math.max(0, old.unreadCount - 1),
            }
          : old,
      );
      queryClient.setQueryData<number>(unreadKey, (old) =>
        Math.max(0, (old ?? 0) - 1),
      );
      return prev;
    },
    onError: (_err, _id, ctx) => ctx && restore(ctx),
  });

  const markAllRead = useMutation<void, Error, void, MarkContext>({
    mutationFn: () => patchNotifications({ all: true }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const prev = snapshot();
      queryClient.setQueryData<NotificationsListData>(listKey, (old) =>
        old
          ? {
              notifications: old.notifications.map((n) => ({
                ...n,
                is_read: true,
              })),
              unreadCount: 0,
            }
          : old,
      );
      queryClient.setQueryData<number>(unreadKey, 0);
      return prev;
    },
    onError: (_err, _vars, ctx) => ctx && restore(ctx),
  });

  return {
    markAsRead: markRead.mutateAsync,
    markAllAsRead: markAllRead.mutateAsync,
  };
}

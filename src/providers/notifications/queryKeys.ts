/**
 * TanStack Query key factories for the notification system. Centralised so
 * every hook (queries, mutations, side-effect bridges) references the same
 * keys without typos.
 */
export const notificationKeys = {
  list: (userId: string | undefined) =>
    ["notifications", "list", userId] as const,
  unread: (userId: string | undefined) =>
    ["notifications", "unread", userId] as const,
  since: (userId: string | undefined) =>
    ["notifications", "since", userId] as const,
};

export type NotificationsListKey = ReturnType<typeof notificationKeys.list>;
export type NotificationsUnreadKey = ReturnType<typeof notificationKeys.unread>;
export type NotificationsSinceKey = ReturnType<typeof notificationKeys.since>;

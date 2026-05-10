import type { Notification } from "@/lib/notificationsDb";

export interface NotificationsListData {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * True if a notification should be visible to this session — personal targeting
 * (`user_id === userId`) or broadcast (`user_id === null`) matching the user's
 * role/audience. Honors the `allowNotifications` preference for broadcasts.
 */
export function isNotificationForUser(
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

export function formatNotificationMessage(n: Notification): string {
  return n.message ? `${n.title}: ${n.message}` : n.title;
}

/**
 * Strips broadcast notifications from a list response when the user has
 * disabled broadcast delivery. Recomputes `unreadCount` accordingly.
 */
export function filterByPermissions(
  data: NotificationsListData,
  allowNotifications: boolean,
): NotificationsListData {
  if (allowNotifications) return data;
  const personal = data.notifications.filter((n) => n.user_id !== null);
  return {
    notifications: personal,
    unreadCount: personal.filter((n) => !n.is_read).length,
  };
}

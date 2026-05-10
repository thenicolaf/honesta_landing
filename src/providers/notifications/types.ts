export type PushState = "unsupported" | "prompt" | "granted" | "denied" | "subscribed";

export interface NotificationsContextValue {
  /** Auth context, exposed so consumer hooks (e.g. `useNotificationsList`) can build their query keys without re-reading auth state. */
  userId?: string;
  role: string | null;
  allowNotifications: boolean;

  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;

  pushState: PushState;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<void>;
}

export interface NotificationsProviderProps {
  children: React.ReactNode;
  role?: string | null;
  userId?: string;
  allowNotifications?: boolean;
  initialUnreadCount?: number;
}

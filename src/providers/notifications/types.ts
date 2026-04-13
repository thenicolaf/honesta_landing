import type { Notification } from "@/lib/notificationsDb";

export type PushState = "unsupported" | "prompt" | "granted" | "denied" | "subscribed";

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
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

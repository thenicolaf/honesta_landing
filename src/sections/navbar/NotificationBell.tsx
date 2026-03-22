"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  getNotificationStyle,
} from "@/shared/ui";
import { usePopover } from "@/shared/ui/Popover";
import { formatDateTime } from "@/shared/ui/Table";
import { useNotifications } from "@/providers";
import { cn } from "@/shared/utils/cn";

function NotificationItem({
  id,
  type,
  title,
  message,
  is_read,
  created_at,
  onRead,
}: {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  onRead: (id: string) => void;
}) {
  const style = getNotificationStyle(type);

  return (
    <button
      type="button"
      onClick={() => !is_read && onRead(id)}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-earth/6 last:border-b-0 transition-colors duration-150",
        is_read ? "opacity-50" : "hover:bg-sand/30",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "rounded-lg p-1.5 shrink-0 mt-0.5",
            style.bg,
            style.iconColor,
          )}
        >
          {style.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body font-semibold text-sm text-earth truncate">
            {title}
          </p>
          {message && (
            <p className="font-body text-2xs text-earth/50 truncate mt-0.5">
              {message}
            </p>
          )}
          <p className="font-body text-xs text-earth/30 mt-1">
            {formatDateTime(created_at)}
          </p>
        </div>
        {!is_read && (
          <span
            className={cn("mt-2 w-2 h-2 rounded-full shrink-0", style.dot)}
          />
        )}
      </div>
    </button>
  );
}

function DashboardLink() {
  const { close } = usePopover();
  return (
    <div className="border-t border-earth/6 px-4 py-2.5">
      <Link
        href="/panel"
        onClick={close}
        className="font-body text-2xs text-earth/50 hover:text-earth transition-colors duration-150"
      >
        View all on Dashboard
      </Link>
    </div>
  );
}

export function NotificationBell({ isAdmin = false }: { isAdmin?: boolean }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <Popover>
      <PopoverTrigger className="relative p-2 text-earth/60 hover:text-earth transition-colors duration-200">
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <Badge
            variant="counter"
            size="pill"
            className="absolute -top-0.5 -right-0.5"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent align="right" className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-earth/6">
          <p className="font-body font-semibold text-sm text-earth">
            Notifications
          </p>
          {unreadCount > 0 && (
            <Button
              as="button"
              type="button"
              variant="text"
              size="inline"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <p className="font-body text-sm text-earth/40 text-center py-8">
              No notifications yet
            </p>
          ) : (
            notifications
              .slice(0, 10)
              .map((n) => (
                <NotificationItem key={n.id} {...n} onRead={markAsRead} />
              ))
          )}
        </div>

        {/* Footer — admin only */}
        {isAdmin && <DashboardLink />}
      </PopoverContent>
    </Popover>
  );
}

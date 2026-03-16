"use client";

import { Bell } from "lucide-react";
import { Card, Loader, EmptyState } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { useNotifications } from "@/providers";
import { cn } from "@/shared/utils/cn";

export function RecentNotifications() {
  const { notifications, isLoading } = useNotifications();

  if (isLoading) return <Loader />;

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-10 h-10 text-earth/15" />}
        label="No notifications yet"
      />
    );
  }

  return (
    <Card padding="none">
      <div className="divide-y divide-earth/6">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3",
              !n.is_read && "bg-orange/3",
            )}
          >
            <div className="rounded-lg bg-sand/60 p-2 text-earth/40 shrink-0 mt-0.5">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body font-semibold text-sm text-earth">
                {n.title}
              </p>
              {n.message && (
                <p className="font-body text-2xs text-earth/50 truncate">
                  {n.message}
                </p>
              )}
              <p className="font-body text-xs text-earth/30 mt-0.5">
                {formatDateTime(n.created_at)}
              </p>
            </div>
            {!n.is_read && (
              <span className="mt-2 w-2 h-2 rounded-full bg-orange shrink-0" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

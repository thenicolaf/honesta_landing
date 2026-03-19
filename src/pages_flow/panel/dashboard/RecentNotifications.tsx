"use client";

import { Bell } from "lucide-react";
import {
  Card,
  Loader,
  EmptyState,
  DataCardPagination,
  useTablePagination,
  getNotificationStyle,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { useNotifications } from "@/providers";
import { cn } from "@/shared/utils/cn";

export function RecentNotifications() {
  const { notifications, isLoading } = useNotifications();
  const { paginatedData, pagination } = useTablePagination(notifications, 10);

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
    <div>
      <Card padding="none">
        <div className="divide-y divide-earth/6">
          {paginatedData.map((n) => {
            const style = getNotificationStyle(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3",
                  !n.is_read && "bg-orange/3",
                )}
              >
                <div className={cn("rounded-lg p-2 shrink-0 mt-0.5", style.bg, style.iconColor)}>
                  {style.icon}
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
                  <span className={cn("mt-2 w-2 h-2 rounded-full shrink-0", style.dot)} />
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <DataCardPagination pagination={pagination} />
    </div>
  );
}

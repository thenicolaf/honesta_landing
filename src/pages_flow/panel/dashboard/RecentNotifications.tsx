"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/notificationsDb";
import {
  Card,
  Skeleton,
  EmptyState,
  DataCardPagination,
  useTablePagination,
  getNotificationStyle,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
} from "@/shared/ui";
import { FormLabel, FormDatePicker } from "@/shared/ui/Form";
import { resolveNotificationHref } from "@/shared/utils/resolveNotificationHref";
import { formatDateTime } from "@/shared/ui/Table";
import { useNotifications, useNotificationsList } from "@/providers";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { useFilterBar, useFilterBarMulti } from "@/providers/FilterProvider";
import { cn } from "@/shared/utils/cn";

const TYPE_OPTIONS = NOTIFICATION_TYPES.map((t) => ({
  value: t,
  label: NOTIFICATION_TYPE_LABELS[t] ?? t,
}));

const FILTER_KEYS = ["notifType", "dateFrom", "dateTo"];
const MULTI_KEYS = ["notifType"];
const EMPTY_NOTIFICATIONS: Notification[] = [];

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function RecentNotificationsInner() {
  const { markAsRead } = useNotifications();
  const { data } = useNotificationsList();
  const notifications = data?.notifications ?? EMPTY_NOTIFICATIONS;
  const typeFilter = useFilterBarMulti("notifType");
  const dateFromFilter = useFilterBar("dateFrom");
  const dateToFilter = useFilterBar("dateTo");
  const router = useRouter();

  const dateFrom = parseDate(dateFromFilter.value);
  const dateTo = parseDate(dateToFilter.value);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter.values.length && !typeFilter.values.includes(n.type)) return false;
      const created = new Date(n.created_at).getTime();
      if (dateFrom && created < dateFrom.getTime()) return false;
      if (dateTo && created > dateTo.getTime()) return false;
      return true;
    });
  }, [notifications, typeFilter.values, dateFrom, dateTo]);

  const { paginatedData, pagination } = useTablePagination(filtered, 10);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <FormLabel>Types</FormLabel>
          <MultiSelect
            value={typeFilter.values}
            onValueChange={typeFilter.onValuesChange}
            options={TYPE_OPTIONS}
            clearable
          >
            <MultiSelectTrigger
              placeholder="All types"
              className="rounded-xl px-3 min-h-9! py-1 text-sm bg-white-warm! border-earth/15! hover:border-earth/35! focus-visible:ring-orange/40"
            />
            <MultiSelectContent searchPlaceholder="Search type…">
              {(opts) => (
                <>
                  {opts.map((o) => (
                    <MultiSelectItem
                      key={o.value}
                      value={o.value}
                      searchValue={o.label}
                    >
                      {o.label}
                    </MultiSelectItem>
                  ))}
                  <MultiSelectEmpty />
                </>
              )}
            </MultiSelectContent>
          </MultiSelect>
        </div>
        <FormDatePicker
          name="dateFrom"
          label="From"
          showTime
          clearable
          placeholder="Any"
          value={dateFrom}
          onValueChange={(d) => dateFromFilter.onValueChange(d ? d.toISOString() : "")}
          className="[&_input]:h-9 [&_input]:bg-white-warm! [&_input]:border-earth/15! [&_input]:hover:border-earth/35! [&_input]:text-sm"
        />
        <FormDatePicker
          name="dateTo"
          label="To"
          showTime
          clearable
          placeholder="Any"
          value={dateTo}
          onValueChange={(d) => dateToFilter.onValueChange(d ? d.toISOString() : "")}
          className="[&_input]:h-9 [&_input]:bg-white-warm! [&_input]:border-earth/15! [&_input]:hover:border-earth/35! [&_input]:text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-earth/15" />}
          label="No notifications match these filters"
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-earth/6">
              {paginatedData.map((n) => {
                const style = getNotificationStyle(n.type);

                async function handleClick() {
                  if (!n.is_read) markAsRead(n.id);
                  const href = await resolveNotificationHref(n.type, n.related_id);
                  if (href) router.push(href);
                }

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={handleClick}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 w-full text-left transition-colors cursor-pointer",
                      !n.is_read && "bg-orange/3 hover:bg-orange/6",
                      n.is_read && "hover:bg-sand/30",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-2 shrink-0 mt-0.5",
                        style.bg,
                        style.iconColor,
                      )}
                    >
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
                      <span
                        className={cn(
                          "mt-2 w-2 h-2 rounded-full shrink-0",
                          style.dot,
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
          <DataCardPagination pagination={pagination} />
        </>
      )}
    </div>
  );
}

export function RecentNotifications() {
  return (
    <SearchParamsFilterProvider keys={FILTER_KEYS} multiKeys={MULTI_KEYS}>
      <RecentNotificationsInner />
    </SearchParamsFilterProvider>
  );
}

export function RecentNotificationsSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <Card padding="none">
        <div className="divide-y divide-earth/6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-60 max-w-full" />
                <Skeleton className="h-3 w-24 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

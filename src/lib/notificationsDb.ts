import { supabaseAdmin } from "./supabase.server";
import { sendPushNotifications, getNotificationUrl } from "./pushNotification";
import type { UserRole } from "@/shared/types";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  user_id: string | null;
  audience: UserRole | null;
  created_at: string;
  is_read: boolean;
};

type DbNotificationRow = Omit<Notification, "is_read"> & {
  notification_reads: { user_id: string }[] | null;
};

interface CreateNotificationParams {
  type: string;
  title: string;
  message?: string;
  relatedId?: string;
  /** Target audience role. NULL = all roles. Default: "admin". */
  audience?: UserRole | null;
  userId?: string;
}

export async function createNotification({
  type,
  title,
  message,
  relatedId,
  audience = "admin",
  userId,
}: CreateNotificationParams) {
  await supabaseAdmin.from("notifications").insert({
    type,
    title,
    message: message ?? null,
    related_id: relatedId ?? null,
    audience,
    user_id: userId ?? null,
  });

  // Send push notifications (fire-and-forget)
  getNotificationUrl(type, relatedId)
    .then((url) =>
      sendPushNotifications({ title, body: message, url, audience, userId }),
    )
    .catch((err) => console.error("[push] Failed to send:", err));
}

export async function getNotifications(
  userId: string,
  role: string,
  limit = 20,
  offset = 0,
  userCreatedAt?: string,
): Promise<Notification[]> {
  let query = supabaseAdmin
    .from("notifications")
    .select("*, notification_reads!left(user_id)")
    .or(
      `user_id.eq.${userId},and(user_id.is.null,audience.is.null),and(user_id.is.null,audience.eq.${role})`,
    )
    .eq("notification_reads.user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (userCreatedAt) {
    query = query.gte("created_at", userCreatedAt);
  }

  const { data, error } = await query;

  if (error) return [];
  return (data as DbNotificationRow[]).map((row) => ({
    ...row,
    is_read: (row.notification_reads?.length ?? 0) > 0,
    notification_reads: undefined,
  })) as Notification[];
}

export async function getUnreadCount(
  userId: string,
  role: string,
  userCreatedAt?: string,
): Promise<number> {
  let query = supabaseAdmin
    .from("notifications")
    .select("id")
    .or(
      `user_id.eq.${userId},and(user_id.is.null,audience.is.null),and(user_id.is.null,audience.eq.${role})`,
    );

  if (userCreatedAt) {
    query = query.gte("created_at", userCreatedAt);
  }

  const { data: visible, error: visibleErr } = await query;

  if (visibleErr || !visible?.length) return 0;

  const visibleIds = visible.map((n) => n.id);
  const { data: reads } = await supabaseAdmin
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", userId)
    .in("notification_id", visibleIds);

  const readSet = new Set((reads ?? []).map((r) => r.notification_id));
  return visibleIds.filter((id) => !readSet.has(id)).length;
}

export async function markAsRead(notificationId: string, userId: string) {
  await supabaseAdmin.from("notification_reads").upsert(
    { notification_id: notificationId, user_id: userId },
    { onConflict: "notification_id,user_id" },
  );
}

export async function markAllAsRead(userId: string, role: string) {
  const { data: visible } = await supabaseAdmin
    .from("notifications")
    .select("id")
    .or(
      `user_id.eq.${userId},and(user_id.is.null,audience.is.null),and(user_id.is.null,audience.eq.${role})`,
    );

  if (!visible?.length) return;

  const visibleIds = visible.map((n) => n.id);

  const { data: reads } = await supabaseAdmin
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", userId)
    .in("notification_id", visibleIds);

  const readSet = new Set((reads ?? []).map((r) => r.notification_id));
  const unreadIds = visibleIds.filter((id) => !readSet.has(id));

  if (!unreadIds.length) return;

  await supabaseAdmin.from("notification_reads").insert(
    unreadIds.map((id) => ({ notification_id: id, user_id: userId })),
  );
}

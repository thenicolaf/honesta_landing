import { supabaseAdmin } from "./supabase.server";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications(limit = 20, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return [];
  return data as Notification[];
}

export async function getUnreadCount() {
  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(id: string) {
  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
}

export async function markAllAsRead() {
  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
}

export async function createNotification(
  type: string,
  title: string,
  message?: string,
  relatedId?: string,
) {
  await supabaseAdmin.from("notifications").insert({
    type,
    title,
    message: message ?? null,
    related_id: relatedId ?? null,
  });
}

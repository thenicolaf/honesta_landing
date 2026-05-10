import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/notificationsDb";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role
    ? { userId: user.id, role: profile.role as string, createdAt: user.created_at }
    : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const since = searchParams.get("since") ?? undefined;

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(
      auth.userId,
      auth.role,
      limit,
      offset,
      auth.createdAt,
      since,
    ),
    getUnreadCount(auth.userId, auth.role, auth.createdAt),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  if (body.all) {
    await markAllAsRead(auth.userId, auth.role);
  } else if (body.id) {
    await markAsRead(body.id, auth.userId);
  }

  return NextResponse.json({ success: true });
}

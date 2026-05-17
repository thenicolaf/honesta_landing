import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import type { UserRole } from "@/shared/types";

export interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  gender: "male" | "female" | null;
  birthday: string | null;
  role: UserRole;
  allowNotifications: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  gender: "male" | "female" | null;
  birthday: string | null;
  role: UserRole | null;
  allow_notifications: boolean | null;
};

type OrderStatsRow = {
  user_id: string | null;
  total: number;
  updated_at: string;
};

interface OrderStats {
  count: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

// TODO: paginate via auth.admin.listUsers({ page }) when registrations exceed 1000.
const USER_FETCH_LIMIT = 1000;

export const getAdminUsers = cache(async (): Promise<AdminUser[]> => {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: USER_FETCH_LIMIT,
  });

  const users = list?.users ?? [];
  if (users.length === 0) return [];

  const ids = users.map((u) => u.id);

  const [profilesRes, ordersRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "id, first_name, last_name, phone, gender, birthday, role, allow_notifications",
      )
      .in("id", ids),
    supabaseAdmin
      .from("orders")
      .select("user_id, total, updated_at")
      .eq("status", OrderStatus.PAID)
      .not("user_id", "is", null)
      .in("user_id", ids),
  ]);

  const profileMap = new Map<string, ProfileRow>();
  for (const p of (profilesRes.data ?? []) as ProfileRow[]) {
    profileMap.set(p.id, p);
  }

  const statsMap = new Map<string, OrderStats>();
  for (const row of (ordersRes.data ?? []) as OrderStatsRow[]) {
    if (!row.user_id) continue;
    const prev = statsMap.get(row.user_id) ?? {
      count: 0,
      totalSpent: 0,
      lastOrderAt: null as string | null,
    };
    prev.count += 1;
    prev.totalSpent += Number(row.total) || 0;
    if (!prev.lastOrderAt || row.updated_at > prev.lastOrderAt) {
      prev.lastOrderAt = row.updated_at;
    }
    statsMap.set(row.user_id, prev);
  }

  return users
    .map((u): AdminUser => {
      const profile = profileMap.get(u.id);
      const stats = statsMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        firstName: profile?.first_name ?? null,
        lastName: profile?.last_name ?? null,
        phone: profile?.phone ?? null,
        gender: profile?.gender ?? null,
        birthday: profile?.birthday ?? null,
        role: profile?.role ?? "user",
        allowNotifications: profile?.allow_notifications ?? true,
        createdAt: u.created_at,
        orderCount: stats?.count ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        lastOrderAt: stats?.lastOrderAt ?? null,
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

export async function getRecentUsers(limit: number): Promise<AdminUser[]> {
  const all = await getAdminUsers();
  return all.slice(0, limit);
}

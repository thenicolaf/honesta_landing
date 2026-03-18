import { supabaseAdmin } from "@/lib/supabase.server";
import { AllOrdersPage } from "@/pages_flow/panel/orders/AllOrdersPage";

export default async function Page() {
  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  const orders = ordersData ?? [];

  const userIds = [
    ...new Set(
      orders
        .map((o) => (o as Record<string, unknown>).user_id as string | null)
        .filter(Boolean),
    ),
  ] as string[];

  const profileMap = new Map<
    string,
    { gender: string | null; birthday: string | null }
  >();

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, gender, birthday")
      .in("id", userIds);

    for (const p of profiles ?? []) {
      profileMap.set(p.id, {
        gender: p.gender ?? null,
        birthday: p.birthday ?? null,
      });
    }
  }

  const enrichedOrders = orders.map((o) => {
    const userId = (o as Record<string, unknown>).user_id as string | null;
    const profile = userId ? profileMap.get(userId) : null;
    return {
      ...o,
      gender: profile?.gender ?? null,
      birthday: profile?.birthday ?? null,
    };
  });

  return <AllOrdersPage orders={enrichedOrders} />;
}

import { supabaseAdmin } from "@/lib/supabase.server";
import type { ProductOption } from "@/pages_flow/panel/promotions/ProductPicker";
import type { UserOption } from "@/pages_flow/panel/promo-codes/UserPicker";

export async function loadProductOptions(): Promise<ProductOption[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, title, product_variants(price)")
    .eq("status", "published")
    .order("title");

  return (data ?? []).map((p) => {
    const prices = (
      (p as { product_variants: { price: string }[] }).product_variants ?? []
    ).map((v) => Number(v.price));
    return {
      value: p.id as string,
      label: p.title as string,
      price: prices.length > 0 ? Math.min(...prices) : 0,
    };
  });
}

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  gender: "male" | "female" | null;
  birthday: string | null;
};

export async function loadUserOptions(): Promise<UserOption[]> {
  // Fetch all auth users (paginate up to perPage=1000 — sufficient for admin picker)
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const users = list?.users ?? [];
  if (users.length === 0) return [];

  const ids = users.map((u) => u.id);

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, gender, birthday")
    .in("id", ids);

  const profileMap = new Map<string, ProfileRow>();
  for (const p of (profiles ?? []) as ProfileRow[]) {
    profileMap.set(p.id, p);
  }

  return users
    .map((u) => {
      const profile = profileMap.get(u.id);
      const fullName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      const label = fullName || u.email || u.id;
      return {
        value: u.id,
        label,
        email: u.email ?? undefined,
        gender: profile?.gender ?? undefined,
        birthday: profile?.birthday ?? undefined,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

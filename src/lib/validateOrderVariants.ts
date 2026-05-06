import { supabaseAdmin } from "@/lib/supabase.server";

/**
 * Returns the subset of variant IDs that no longer exist in `product_variants`.
 * Used as a defensive pre-check before inserting `order_items` (the FK would
 * otherwise raise a confusing constraint-violation error). Common causes:
 * admin re-edited a product and removed/replaced a variant, or a mix variant
 * was orphan-cleaned while still in cart.
 */
export async function findMissingVariantIds(
  variantIds: string[],
): Promise<string[]> {
  if (variantIds.length === 0) return [];
  const { data } = await supabaseAdmin
    .from("product_variants")
    .select("id")
    .in("id", variantIds);
  const existing = new Set((data ?? []).map((v) => v.id as string));
  return variantIds.filter((id) => !existing.has(id));
}

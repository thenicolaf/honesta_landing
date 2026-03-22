import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFavoritesFromDb(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("product_id");

  if (error || !data) return [];

  return data.map((row: { product_id: string }) => row.product_id);
}

export async function addFavoriteToDb(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<void> {
  await supabase
    .from("user_favorites")
    .insert({ user_id: userId, product_id: productId });
}

export async function removeFavoriteFromDb(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<void> {
  await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

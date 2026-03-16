import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";

type CartRow = {
  product_id: string;
  name: string;
  price: number;
  original_price: number | null;
  quantity: number;
  image_url: string | null;
};

export async function getCartFromDb(
  supabase: SupabaseClient,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, name, price, original_price, quantity, image_url");

  if (error || !data) return [];

  return (data as CartRow[]).map((row) => ({
    id: row.product_id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    quantity: row.quantity,
    image_url: row.image_url ?? undefined,
  }));
}

export async function upsertItemInDb(
  supabase: SupabaseClient,
  userId: string,
  item: CartItem,
): Promise<void> {
  await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: item.id,
      name: item.name,
      price: item.price,
      original_price: item.originalPrice ?? null,
      quantity: item.quantity,
      image_url: item.image_url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  );
}

export async function removeItemFromDb(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<void> {
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function updateQuantityInDb(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
  quantity: number,
): Promise<void> {
  await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function clearCartInDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase.from("cart_items").delete().eq("user_id", userId);
}

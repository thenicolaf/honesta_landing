import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/sections/products/types";
import {
  calculateDiscountedPrice,
  findActivePromotion,
  type PromotionRow,
} from "@/shared/utils/calculateDiscount";

type CartDbRow = {
  variant_id: string;
  quantity: number;
  product_variants: {
    id: string;
    weight_g: number;
    price: string;
    product_id: string;
    products: {
      title: string;
      slug: string;
      image_url: string | null;
      promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
    };
  };
};

export async function getCartItemCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);

  if (!data) return 0;
  return data.reduce((sum, row) => sum + row.quantity, 0);
}

export async function getCartFromDb(
  supabase: SupabaseClient,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `variant_id, quantity,
       product_variants(
         id, weight_g, price, product_id,
         products(title, slug, image_url,
           promotion_products(promotions(discount_type, discount_value, starts_at, ends_at, is_active))
         )
       )`,
    );

  if (error || !data) return [];

  return (data as unknown as CartDbRow[]).map((row) => {
    const v = row.product_variants;
    const product = v.products;
    const originalPrice = Number(v.price);
    const activePromo = findActivePromotion(product.promotion_products);

    const price = activePromo
      ? calculateDiscountedPrice(
          originalPrice,
          activePromo.discount_type as "percentage" | "fixed",
          Number(activePromo.discount_value),
        )
      : originalPrice;

    return {
      variantId: v.id,
      productId: v.product_id,
      slug: product.slug,
      name: product.title,
      price,
      originalPrice: activePromo ? originalPrice : undefined,
      promotionEndsAt: activePromo?.ends_at ?? undefined,
      quantity: row.quantity,
      image_url: product.image_url ?? undefined,
      weight_g: v.weight_g,
    };
  });
}

export async function upsertItemInDb(
  supabase: SupabaseClient,
  userId: string,
  item: CartItem,
): Promise<void> {
  await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      variant_id: item.variantId,
      quantity: item.quantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,variant_id" },
  );
}

export async function removeItemFromDb(
  supabase: SupabaseClient,
  userId: string,
  variantId: string,
): Promise<void> {
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("variant_id", variantId);
}

export async function updateQuantityInDb(
  supabase: SupabaseClient,
  userId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("variant_id", variantId);
}

export async function clearCartInDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase.from("cart_items").delete().eq("user_id", userId);
}

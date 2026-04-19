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
      status: string;
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
         products(title, slug, image_url, status,
           promotion_products(promotions(discount_type, discount_value, starts_at, ends_at, is_active))
         )
       )`,
    );

  if (error || !data) return [];

  const rows = data as unknown as CartDbRow[];

  const mixVariantIds = rows
    .filter((r) => r.product_variants.products.status === "system")
    .map((r) => r.product_variants.id);

  type MixCellRow = {
    variant_id: string;
    preset_id: string;
    mix_box_presets: {
      weight_g: number;
      price: string;
      product: { title: string; image_url: string | null } | null;
    };
  };

  const mixCellsMap = new Map<
    string,
    CartItem["mixItems"]
  >();

  if (mixVariantIds.length > 0) {
    const { data: cells } = await supabase
      .from("mix_variant_cells")
      .select(
        "variant_id, preset_id, mix_box_presets:preset_id(weight_g, price, product:products(title, image_url))",
      )
      .in("variant_id", mixVariantIds);

    if (cells) {
      const grouped = new Map<string, Map<string, { name: string; image_url?: string; count: number; weight_g: number; price: number }>>();
      for (const cell of cells as unknown as MixCellRow[]) {
        if (!grouped.has(cell.variant_id)) grouped.set(cell.variant_id, new Map());
        const presetMap = grouped.get(cell.variant_id)!;
        const preset = cell.mix_box_presets;
        const product = preset.product as unknown;
        const prod = (Array.isArray(product) ? product[0] : product) as { title: string; image_url: string | null } | null;
        const key = cell.preset_id;
        const existing = presetMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          presetMap.set(key, {
            name: prod?.title ?? "—",
            image_url: prod?.image_url ?? undefined,
            count: 1,
            weight_g: preset.weight_g,
            price: Number(preset.price),
          });
        }
      }
      for (const [variantId, presetMap] of grouped) {
        mixCellsMap.set(variantId, Array.from(presetMap.values()));
      }
    }
  }

  return rows.map((row) => {
    const v = row.product_variants;
    const product = v.products;
    const isMix = product.status === "system";
    const originalPrice = Number(v.price);
    const activePromo = isMix
      ? null
      : findActivePromotion(product.promotion_products);

    const price = activePromo
      ? calculateDiscountedPrice(
          originalPrice,
          activePromo.discount_type as "percentage" | "fixed",
          Number(activePromo.discount_value),
        )
      : originalPrice;

    const item: CartItem = {
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

    if (isMix) {
      item.isMix = true;
      item.mixItems = mixCellsMap.get(v.id);
    }

    return item;
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

/**
 * Clears the user's cart and cleans up orphaned mix-variants in a single pass.
 * Use this instead of clearCartInDb after checkout or when clearing the cart from the user's side.
 */
export async function clearCartAndCleanup(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data } = await supabase
    .from("cart_items")
    .select("variant_id")
    .eq("user_id", userId);

  const variantIds = (data ?? []).map((r) => r.variant_id as string);

  await supabase.from("cart_items").delete().eq("user_id", userId);

  if (variantIds.length > 0) {
    const { cleanupOrphanedMixVariants } = await import(
      "@/pages_flow/mix/actions"
    );
    await cleanupOrphanedMixVariants(variantIds);
  }
}

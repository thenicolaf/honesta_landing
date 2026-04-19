"use server";

import { supabaseAdmin } from "@/lib/supabase.server";
import type { CartItem } from "@/sections/products/types/types";

interface Selection {
  presetId: string;
  count: number;
}

export async function assembleMixAction(
  boxId: string,
  selections: Selection[],
): Promise<{ cartItem: CartItem } | { error: string }> {
  try {
    const { data: box } = await supabaseAdmin
      .from("mix_boxes")
      .select("id, name, slug, image_url, cell_count, is_active")
      .eq("id", boxId)
      .single();

    if (!box) return { error: "Mix box not found." };
    if (!box.is_active) return { error: "This mix box is no longer available." };

    const totalCells = selections.reduce((sum, s) => sum + s.count, 0);
    if (totalCells !== box.cell_count) {
      return { error: `Please fill all ${box.cell_count} cells.` };
    }

    const presetIds = selections.map((s) => s.presetId);
    const { data: presets } = await supabaseAdmin
      .from("mix_box_presets")
      .select("id, product_id, weight_g, price, product:products(title, image_url)")
      .eq("box_id", boxId)
      .in("id", presetIds);

    if (!presets || presets.length !== presetIds.length) {
      return { error: "Some selected products are no longer available." };
    }

    const presetMap = new Map(presets.map((p) => [p.id, p]));

    let totalPrice = 0;
    let totalWeight = 0;
    for (const { presetId, count } of selections) {
      const preset = presetMap.get(presetId);
      if (!preset) return { error: "Invalid preset selection." };
      totalPrice += Number(preset.price) * count;
      totalWeight += preset.weight_g * count;
    }

    const { data: newVariant, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: boxId,
        weight_g: totalWeight,
        price: totalPrice,
      })
      .select("id")
      .single();

    if (variantError || !newVariant) {
      return { error: "Failed to create mix variant. Please try again." };
    }

    const variantId = newVariant.id;

    const cells: { variant_id: string; cell_index: number; preset_id: string }[] = [];
    let cellIndex = 0;
    for (const { presetId, count } of selections) {
      for (let j = 0; j < count; j++) {
        cells.push({ variant_id: variantId, cell_index: cellIndex++, preset_id: presetId });
      }
    }

    await supabaseAdmin.from("mix_variant_cells").insert(cells);

    const mixItems = selections
      .filter((s) => s.count > 0)
      .map((s) => {
        const preset = presetMap.get(s.presetId)!;
        const rawProduct = preset.product as unknown;
        const product = (
          Array.isArray(rawProduct) ? rawProduct[0] : rawProduct
        ) as { title: string; image_url: string | null } | null;
        return {
          name: product?.title ?? "—",
          image_url: product?.image_url ?? undefined,
          count: s.count,
          weight_g: preset.weight_g,
          price: Number(preset.price),
        };
      });

    const cartItem: CartItem = {
      variantId,
      productId: boxId,
      name: box.name,
      price: totalPrice,
      weight_g: totalWeight,
      image_url: box.image_url ?? undefined,
      quantity: 1,
      isMix: true,
      mixItems,
    };

    return { cartItem };
  } catch (err) {
    console.error("assembleMix error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function cleanupOrphanedMixVariants(
  variantIds: string[],
): Promise<{ cleaned: number }> {
  if (variantIds.length === 0) return { cleaned: 0 };

  try {
    const { data: mixVariants } = await supabaseAdmin
      .from("product_variants")
      .select("id, products!inner(status)")
      .in("id", variantIds)
      .eq("products.status", "system");

    const orphanIds = (mixVariants ?? []).map((v) => v.id);
    if (orphanIds.length === 0) return { cleaned: 0 };

    const { error } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .in("id", orphanIds);

    if (error) {
      console.error("cleanupOrphanedMixVariants delete error:", error);
      return { cleaned: 0 };
    }

    return { cleaned: orphanIds.length };
  } catch (err) {
    console.error("cleanupOrphanedMixVariants error:", err);
    return { cleaned: 0 };
  }
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import {
  createOrderWithItems,
  type OrderItemRow,
  type MixCompositionEntry,
} from "@/lib/orders";
import { getDeliverySettingByEmirate } from "@/lib/deliveryDb";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import {
  calculateDiscountedPrice,
  findActivePromotion,
  type PromotionRow,
} from "@/shared/utils/calculateDiscount";
import type { CustomerInfo } from "@/shared/types";
import { OrderStatus } from "@/shared/types";
import { DEFAULT_EMIRATE } from "@/shared/consts";
import {
  validateCustomer,
  type CustomerErrors,
} from "@/shared/utils/validateCustomer";

export interface ManualOrderState {
  error?: string;
  fieldErrors?: CustomerErrors & { items?: string };
  values?: Partial<CustomerInfo> & { items?: string };
}

interface PickedItem {
  variantId: string;
  quantity: number;
}

type VariantRow = {
  id: string;
  weight_g: number;
  price: string | number;
  products: {
    id: string;
    slug: string | null;
    title: string;
    image_url: string | null;
    promotion_products: { promotions: PromotionRow | PromotionRow[] }[];
  } | null;
};

interface PendingMixPayload {
  boxId: string;
  selections: { presetId: string; count: number }[];
}

type PresetRow = {
  id: string;
  weight_g: number;
  price: string | number;
  product: { title: string; image_url: string | null } | null;
};

type BoxRow = {
  id: string;
  name: string;
  image_url: string | null;
  cell_count: number;
  is_active: boolean;
  presets: PresetRow[];
};

function parsePickedItems(raw: string | null): PickedItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => {
        const row = r as Partial<PickedItem>;
        const variantId = typeof row.variantId === "string" ? row.variantId : "";
        const quantity =
          typeof row.quantity === "number" && row.quantity > 0
            ? Math.floor(row.quantity)
            : 0;
        return { variantId, quantity };
      })
      .filter((r) => r.variantId && r.quantity > 0);
  } catch {
    return [];
  }
}

function parsePendingMixes(raw: string | null): PendingMixPayload[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => {
        const row = r as Partial<PendingMixPayload>;
        const boxId = typeof row.boxId === "string" ? row.boxId : "";
        const selectionsRaw = Array.isArray(row.selections) ? row.selections : [];
        const selections = selectionsRaw
          .map((s) => {
            const sel = s as Partial<{ presetId: string; count: number }>;
            const presetId =
              typeof sel.presetId === "string" ? sel.presetId : "";
            const count =
              typeof sel.count === "number" && sel.count > 0
                ? Math.floor(sel.count)
                : 0;
            return { presetId, count };
          })
          .filter((s) => s.presetId && s.count > 0);
        return { boxId, selections };
      })
      .filter((m) => m.boxId && m.selections.length > 0);
  } catch {
    return [];
  }
}

/**
 * Builds an OrderItemRow for a pending manual mix:
 *  - validates selections against the box (active, fully filled, presets belong to box)
 *  - computes price/weight snapshot
 *  - produces the mix_composition JSONB directly (no DB inserts to product_variants/mix_variant_cells)
 */
function buildMixOrderRow(
  box: BoxRow,
  selections: { presetId: string; count: number }[],
): { row: OrderItemRow } | { error: string } {
  if (!box.is_active) {
    return { error: `"${box.name}" is no longer available.` };
  }

  const totalCells = selections.reduce((sum, s) => sum + s.count, 0);
  if (totalCells !== box.cell_count) {
    return {
      error: `"${box.name}" must have exactly ${box.cell_count} cells filled.`,
    };
  }

  const presetMap = new Map(box.presets.map((p) => [p.id, p]));
  let price = 0;
  let weight = 0;
  const composition: MixCompositionEntry[] = [];

  for (const s of selections) {
    const preset = presetMap.get(s.presetId);
    if (!preset) {
      return {
        error: `Selected item in "${box.name}" is no longer available.`,
      };
    }
    price += Number(preset.price) * s.count;
    weight += preset.weight_g * s.count;
    composition.push({
      name: preset.product?.title ?? "—",
      image_url: preset.product?.image_url ?? null,
      count: s.count,
      weight_g: preset.weight_g,
      price: Number(preset.price),
    });
  }

  return {
    row: {
      variant_id: null,
      name: box.name,
      price,
      original_price: null,
      promo_discount: 0,
      quantity: 1,
      weight_g: weight,
      mix_composition: composition,
    },
  };
}

export async function createManualOrderAction(
  _prevState: ManualOrderState | null,
  formData: FormData,
): Promise<ManualOrderState> {
  const customer = Object.fromEntries(formData) as Partial<CustomerInfo> & {
    items?: string;
  };

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", values: customer };
    }
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return { error: "Admin access required", values: customer };
    }

    const fieldErrors: ManualOrderState["fieldErrors"] =
      validateCustomer(customer) ?? {};

    const picked = parsePickedItems(
      (formData.get("items") as string | null) ?? null,
    );
    const pendingMixes = parsePendingMixes(
      (formData.get("mixes") as string | null) ?? null,
    );
    if (picked.length === 0 && pendingMixes.length === 0) {
      fieldErrors.items = "Add at least one product or mix";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values: customer };
    }

    const regularRows: OrderItemRow[] = [];
    if (picked.length > 0) {
      const variantIds = picked.map((p) => p.variantId);
      const { data: variants, error: variantsError } = await supabaseAdmin
        .from("product_variants")
        .select(
          `id, weight_g, price,
           products!inner(
             id, slug, title, image_url,
             promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active))
           )`,
        )
        .in("id", variantIds);

      if (variantsError || !variants) {
        return {
          error: "Failed to load products. Please try again.",
          values: customer,
        };
      }

      const variantMap = new Map<string, VariantRow>();
      for (const v of variants as unknown as VariantRow[]) {
        variantMap.set(v.id, v);
      }

      for (const p of picked) {
        const v = variantMap.get(p.variantId);
        if (!v || !v.products) {
          return {
            error: "One of the selected products is no longer available.",
            values: customer,
          };
        }
        const originalPrice = Number(v.price);
        const activePromo = findActivePromotion(
          v.products.promotion_products ?? [],
        );
        const finalPrice = activePromo
          ? calculateDiscountedPrice(
              originalPrice,
              activePromo.discount_type as "percentage" | "fixed",
              Number(activePromo.discount_value),
            )
          : originalPrice;
        regularRows.push({
          variant_id: v.id,
          name: v.products.title,
          price: finalPrice,
          original_price: activePromo ? originalPrice : null,
          promo_discount: 0,
          quantity: p.quantity,
          weight_g: v.weight_g,
          mix_composition: null,
        });
      }
    }

    const mixRows: OrderItemRow[] = [];
    if (pendingMixes.length > 0) {
      const boxIds = [...new Set(pendingMixes.map((m) => m.boxId))];
      const { data: boxes, error: boxesError } = await supabaseAdmin
        .from("mix_boxes")
        .select(
          `id, name, image_url, cell_count, is_active,
           presets:mix_box_presets(
             id, weight_g, price,
             product:products(title, image_url)
           )`,
        )
        .in("id", boxIds);

      if (boxesError || !boxes) {
        return {
          error: "Failed to load mix boxes. Please try again.",
          values: customer,
        };
      }

      const boxMap = new Map<string, BoxRow>();
      for (const b of boxes as unknown as BoxRow[]) {
        boxMap.set(b.id, b);
      }

      for (const m of pendingMixes) {
        const box = boxMap.get(m.boxId);
        if (!box) {
          return {
            error: "One of the selected mix boxes is no longer available.",
            values: customer,
          };
        }
        const built = buildMixOrderRow(box, m.selections);
        if ("error" in built) {
          return { error: built.error, values: customer };
        }
        mixRows.push(built.row);
      }
    }

    const orderRows: OrderItemRow[] = [...regularRows, ...mixRows];

    let subtotal = 0;
    let originalSubtotal = 0;
    for (const r of orderRows) {
      subtotal += r.price * r.quantity;
      originalSubtotal += (r.original_price ?? r.price) * r.quantity;
    }
    const promotionDiscount = originalSubtotal - subtotal;

    const emirate =
      (formData.get("emirate") as string | null)?.trim() || DEFAULT_EMIRATE;
    const setting = await getDeliverySettingByEmirate(emirate);
    const delivery = calculateDelivery(
      subtotal,
      emirate,
      setting ? [setting] : [],
    );

    const { data: order, error: orderError } = await createOrderWithItems({
      items: orderRows,
      customer,
      subtotal,
      deliveryFee: delivery.fee,
      promotionDiscount,
      status: OrderStatus.PAID,
    });
    if (orderError || !order) {
      return {
        error: orderError ?? "Failed to create order. Please try again.",
        values: customer,
      };
    }

    revalidatePath("/panel/all-orders");
    revalidatePath("/panel");
    redirect("/panel/all-orders");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("createManualOrderAction error:", err);
    return {
      error: "Something went wrong. Please try again.",
      values: customer,
    };
  }
}

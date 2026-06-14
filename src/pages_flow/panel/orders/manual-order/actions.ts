"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase.server";
import {
  createOrderWithItems,
  type OrderItemRow,
  type MixCompositionEntry,
} from "@/lib/orders";
import { getDeliverySettingByEmirate } from "@/lib/deliveryDb";
import { deductInventoryForOrder } from "@/lib/inventoryDb";
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
  values?: Partial<CustomerInfo> & {
    items?: string;
    delivery_schedule?: string;
  };
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
  product: { id: string; title: string; image_url: string | null } | null;
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
        const variantId =
          typeof row.variantId === "string" ? row.variantId : "";
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
        const selectionsRaw = Array.isArray(row.selections)
          ? row.selections
          : [];
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
    if (!preset.product) {
      return {
        error: `Selected item in "${box.name}" is no longer available.`,
      };
    }
    price += Number(preset.price) * s.count;
    weight += preset.weight_g * s.count;
    composition.push({
      product_id: preset.product.id,
      name: preset.product.title,
      image_url: preset.product.image_url,
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

// ─── Phase-1 loaders ─────────────────────────────────────────────────────────
// Each returns a discriminated union { ok: true, data } | { ok: false, error }
// so the orchestrator below can fail fast without nested if-checks.

type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

async function loadAuthorizedAdmin(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { ok: false, error: "Admin access required" };
  return { ok: true, userId: user.id };
}

type LoadResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function loadVariants(
  variantIds: string[],
): Promise<LoadResult<VariantRow[]>> {
  if (variantIds.length === 0) return { ok: true, data: [] };
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select(
      `id, weight_g, price,
       products!inner(
         id, slug, title, image_url,
         promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active))
       )`,
    )
    .in("id", variantIds);
  if (error || !data) {
    return { ok: false, error: "Failed to load products. Please try again." };
  }
  return { ok: true, data: data as unknown as VariantRow[] };
}

async function loadMixBoxes(boxIds: string[]): Promise<LoadResult<BoxRow[]>> {
  if (boxIds.length === 0) return { ok: true, data: [] };
  const { data, error } = await supabaseAdmin
    .from("mix_boxes")
    .select(
      `id, name, image_url, cell_count, is_active,
       presets:mix_box_presets(
         id, weight_g, price,
         product:products(id, title, image_url)
       )`,
    )
    .in("id", boxIds);
  if (error || !data) {
    return { ok: false, error: "Failed to load mix boxes. Please try again." };
  }
  return { ok: true, data: data as unknown as BoxRow[] };
}

// ─── Action ──────────────────────────────────────────────────────────────────

export async function createManualOrderAction(
  _prevState: ManualOrderState | null,
  formData: FormData,
): Promise<ManualOrderState> {
  const customer = Object.fromEntries(formData) as Partial<CustomerInfo> & {
    items?: string;
  };

  try {
    const supabase = await createSupabaseServerClient();

    // Synchronous parsing — no I/O.
    const picked = parsePickedItems(
      (formData.get("items") as string | null) ?? null,
    );
    const pendingMixes = parsePendingMixes(
      (formData.get("mixes") as string | null) ?? null,
    );
    const deliverySchedule =
      ((formData.get("delivery_schedule") as string | null) ?? "").trim() ||
      null;
    const emirate =
      (formData.get("emirate") as string | null)?.trim() || DEFAULT_EMIRATE;

    const variantIds = picked.map((p) => p.variantId);
    const boxIds = [...new Set(pendingMixes.map((m) => m.boxId))];

    // Phase 1 — fan out all read-only I/O in parallel. Auth + profile is the
    // only chained step; everything else only depends on synchronously-parsed
    // formData.
    const [auth, deliverySetting, variants, boxes] = await Promise.all([
      loadAuthorizedAdmin(supabase),
      getDeliverySettingByEmirate(emirate),
      loadVariants(variantIds),
      loadMixBoxes(boxIds),
    ]);

    if (!auth.ok) return { error: auth.error, values: customer };

    // Phase 2 — pure validation, no I/O.
    const fieldErrors: ManualOrderState["fieldErrors"] =
      validateCustomer(customer) ?? {};

    if (picked.length === 0 && pendingMixes.length === 0) {
      fieldErrors.items = "Add at least one product or mix";
    }
    // Delivery date/slot are optional for manual admin orders — the admin may
    // leave them empty (order is saved with delivery_schedule = null).
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values: customer };
    }

    if (!variants.ok) return { error: variants.error, values: customer };
    if (!boxes.ok) return { error: boxes.error, values: customer };

    // Phase 3 — build OrderItemRow[] from the already-fetched data.
    const variantMap = new Map(variants.data.map((v) => [v.id, v]));
    const regularRows: OrderItemRow[] = [];
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

    const boxMap = new Map(boxes.data.map((b) => [b.id, b]));
    const mixRows: OrderItemRow[] = [];
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

    const orderRows: OrderItemRow[] = [...regularRows, ...mixRows];

    let subtotal = 0;
    let originalSubtotal = 0;
    for (const r of orderRows) {
      subtotal += r.price * r.quantity;
      originalSubtotal += (r.original_price ?? r.price) * r.quantity;
    }
    const promotionDiscount = originalSubtotal - subtotal;

    const delivery = calculateDelivery(
      subtotal,
      emirate,
      deliverySetting ? [deliverySetting] : [],
    );

    // Phase 4 — write the order.
    const { data: order, error: orderError } = await createOrderWithItems({
      items: orderRows,
      customer,
      subtotal,
      deliveryFee: delivery.fee,
      promotionDiscount,
      status: OrderStatus.PAID,
      deliverySchedule,
    });
    if (orderError || !order) {
      return {
        error: orderError ?? "Failed to create order. Please try again.",
        values: customer,
      };
    }

    // Phase 5 — side-effects. revalidatePath is synchronous, so it runs while
    // we await the inventory deduction.
    revalidatePath("/panel/all-orders");
    revalidatePath("/panel");
    await deductInventoryForOrder(order.id);

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

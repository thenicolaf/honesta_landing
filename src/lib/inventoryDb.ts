import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase.server";
import type { MixCompositionEntry } from "@/lib/orders";

// ============================================================================
// Public types
// ============================================================================

export type StockMovementReason =
  | "order_paid"
  | "restock"
  | "correction"
  | "damage"
  | "manual_adjust";

export type InventoryStatus = "in" | "low" | "out";

export interface InventoryRow {
  product_id: string;
  product_title: string;
  product_slug: string;
  product_image_url: string | null;
  stock_g: number;
  low_stock_threshold_g: number;
  cost_per_100g: number;
  status: InventoryStatus;
}

export interface StockMovement {
  id: string;
  product_id: string;
  delta_g: number;
  reason: StockMovementReason;
  order_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

/** Movement enriched with product snapshot for the global history page. */
export interface StockMovementWithProduct extends StockMovement {
  product_title: string;
  product_image_url: string | null;
}

export interface InventoryDeductionResult {
  deductedProducts: { id: string; title: string; new_stock_g: number }[];
  alreadyDeducted: boolean;
  error?: string;
}

interface InventoryFilter {
  search?: string;
  status?: InventoryStatus | "all";
}

// ============================================================================
// Constants & shared helpers
// ============================================================================

const DEFAULT_THRESHOLD_G = 500;

function resolveStatus(stockG: number, thresholdG: number): InventoryStatus {
  if (stockG <= 0) return "out";
  if (stockG < thresholdG) return "low";
  return "in";
}

/** Supabase returns a nested relation as either a single object or a single-element array. */
function unwrapRelation<T>(raw: T | T[] | null | undefined): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

// ============================================================================
// getInventoryRows — list page (admin /panel/inventory)
// ============================================================================

interface InventoryDbRow {
  id: string;
  slug: string | null;
  title: string;
  image_url: string | null;
  product_inventory:
    | {
        stock_g: number;
        low_stock_threshold_g: number;
        cost_per_100g: string | number;
        updated_at: string | null;
      }
    | {
        stock_g: number;
        low_stock_threshold_g: number;
        cost_per_100g: string | number;
        updated_at: string | null;
      }[]
    | null;
}

interface AnnotatedInventoryRow {
  row: InventoryRow;
  /** Sort key — UNIX ms of `product_inventory.updated_at`, or -Infinity when no inventory row exists yet. */
  updatedAt: number;
}

function buildInventoryRow(p: InventoryDbRow): AnnotatedInventoryRow {
  const inv = unwrapRelation(p.product_inventory);
  const stock_g = inv?.stock_g ?? 0;
  const low_stock_threshold_g = inv?.low_stock_threshold_g ?? DEFAULT_THRESHOLD_G;
  return {
    row: {
      product_id: p.id,
      product_title: p.title,
      product_slug: p.slug ?? "",
      product_image_url: p.image_url,
      stock_g,
      low_stock_threshold_g,
      cost_per_100g: Number(inv?.cost_per_100g ?? 0),
      status: resolveStatus(stock_g, low_stock_threshold_g),
    },
    updatedAt: inv?.updated_at ? new Date(inv.updated_at).getTime() : -Infinity,
  };
}

function matchesInventoryFilter(row: InventoryRow, filter?: InventoryFilter): boolean {
  const search = filter?.search?.trim().toLowerCase();
  const status = filter?.status ?? "all";
  if (search && !row.product_title.toLowerCase().includes(search)) return false;
  if (status !== "all" && row.status !== status) return false;
  return true;
}

function compareAnnotatedRows(a: AnnotatedInventoryRow, b: AnnotatedInventoryRow): number {
  if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt;
  return a.row.product_title.localeCompare(b.row.product_title);
}

/**
 * Single LEFT JOIN — every non-system, non-archived product is listed,
 * even if it has no row in product_inventory yet (returns defaults via COALESCE).
 *
 * Sorted by `product_inventory.updated_at DESC` so a just-adjusted product
 * floats to the top; product title breaks ties.
 */
export const getInventoryRows = cache(
  async (filter?: InventoryFilter): Promise<InventoryRow[]> => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `id, slug, title, image_url, status,
         product_inventory(stock_g, low_stock_threshold_g, cost_per_100g, updated_at)`,
      )
      .not("status", "in", "(system,archived)");

    if (error || !data) return [];

    return (data as unknown as InventoryDbRow[])
      .map(buildInventoryRow)
      .filter(({ row }) => matchesInventoryFilter(row, filter))
      .sort(compareAnnotatedRows)
      .map(({ row }) => row);
  },
);

/** Single inventory row (for the edit dialog / movements dialog header). */
export async function getInventoryRow(
  productId: string,
): Promise<InventoryRow | null> {
  const rows = await getInventoryRows();
  return rows.find((r) => r.product_id === productId) ?? null;
}

// ============================================================================
// Stock movements — read paths
// ============================================================================

/** Last N movements for a product, newest first. */
export async function getMovements(
  productId: string,
  limit = 50,
): Promise<StockMovement[]> {
  const { data, error } = await supabaseAdmin
    .from("stock_movements")
    .select(
      "id, product_id, delta_g, reason, order_id, note, created_by, created_at",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as StockMovement[];
}

interface MovementDbRow extends StockMovement {
  product:
    | { title: string; image_url: string | null }
    | { title: string; image_url: string | null }[]
    | null;
}

function buildMovementWithProduct(r: MovementDbRow): StockMovementWithProduct {
  const product = unwrapRelation(r.product);
  return {
    id: r.id,
    product_id: r.product_id,
    delta_g: r.delta_g,
    reason: r.reason,
    order_id: r.order_id,
    note: r.note,
    created_by: r.created_by,
    created_at: r.created_at,
    product_title: product?.title ?? "—",
    product_image_url: product?.image_url ?? null,
  };
}

/**
 * All movements with product snapshot (one JOIN). For the global history page.
 * Default cap of 1000 rows is sized for early-stage data; switch to cursor
 * pagination when this becomes hot.
 */
export async function getAllMovements(
  limit = 1000,
): Promise<StockMovementWithProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("stock_movements")
    .select(
      `id, product_id, delta_g, reason, order_id, note, created_by, created_at,
       product:products(title, image_url)`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as unknown as MovementDbRow[]).map(buildMovementWithProduct);
}

// ============================================================================
// Inventory settings & manual stock movements — write paths
// ============================================================================

/**
 * UPSERT cost_per_100g + low_stock_threshold_g without touching stock_g.
 * Called from the product create/update form.
 */
export async function upsertInventorySettings(params: {
  productId: string;
  costPer100g: number;
  lowStockThresholdG: number;
}): Promise<{ error?: string }> {
  const { productId, costPer100g, lowStockThresholdG } = params;
  const { error } = await supabaseAdmin.from("product_inventory").upsert(
    {
      product_id: productId,
      cost_per_100g: costPer100g,
      low_stock_threshold_g: lowStockThresholdG,
    },
    { onConflict: "product_id" },
  );
  if (error) return { error: error.message };
  return {};
}

/** Read current stock, clamp `prev + delta` to [0, ∞), UPSERT, return next. */
async function applyStockDelta(
  productId: string,
  deltaG: number,
): Promise<{ error?: string; newStock?: number }> {
  const { data: existing } = await supabaseAdmin
    .from("product_inventory")
    .select("stock_g")
    .eq("product_id", productId)
    .maybeSingle();

  const prev = existing?.stock_g ?? 0;
  const next = Math.max(0, prev + deltaG);

  const { error } = await supabaseAdmin
    .from("product_inventory")
    .upsert(
      { product_id: productId, stock_g: next },
      { onConflict: "product_id" },
    );
  if (error) return { error: error.message };
  return { newStock: next };
}

/**
 * Manual stock movement (restock / correction / damage / manual_adjust).
 * Inserts a movement row, then UPSERTs product_inventory.stock_g atomically per call.
 */
export async function recordStockMovement(params: {
  productId: string;
  deltaG: number;
  reason: StockMovementReason;
  note?: string;
  createdBy?: string;
}): Promise<{ error?: string; newStock?: number }> {
  const { productId, deltaG, reason, note, createdBy } = params;
  if (!Number.isInteger(deltaG) || deltaG === 0) {
    return { error: "Delta must be a non-zero integer" };
  }

  const { error: movementError } = await supabaseAdmin
    .from("stock_movements")
    .insert({
      product_id: productId,
      delta_g: deltaG,
      reason,
      note: note ?? null,
      created_by: createdBy ?? null,
    });
  if (movementError) return { error: movementError.message };

  return applyStockDelta(productId, deltaG);
}

// ============================================================================
// deductInventoryForOrder — auto-deduction on PAID
// ============================================================================

interface DeductionItemRow {
  variant_id: string | null;
  weight_g: number | null;
  quantity: number;
  mix_composition: MixCompositionEntry[] | null;
  product_variants:
    | {
        product_id: string;
        products: { status: string } | { status: string }[] | null;
      }
    | {
        product_id: string;
        products: { status: string } | { status: string }[] | null;
      }[]
    | null;
}

interface InsertedMovement {
  product_id: string;
  delta_g: number;
}

async function loadOrderItemsForDeduction(orderId: string) {
  return await supabaseAdmin
    .from("order_items")
    .select(
      `variant_id, weight_g, quantity, mix_composition,
       product_variants:variant_id(
         product_id,
         products:product_id(status)
       )`,
    )
    .eq("order_id", orderId);
}

function addGrams(
  totals: Map<string, number>,
  productId: string,
  grams: number,
): void {
  if (grams <= 0) return;
  totals.set(productId, (totals.get(productId) ?? 0) + grams);
}

function addMixCompositionGrams(
  totals: Map<string, number>,
  composition: MixCompositionEntry[],
  itemQuantity: number,
): void {
  for (const entry of composition) {
    if (!entry.product_id) continue;
    addGrams(totals, entry.product_id, entry.weight_g * entry.count * itemQuantity);
  }
}

function addRegularItemGrams(
  totals: Map<string, number>,
  row: DeductionItemRow,
): void {
  const variant = unwrapRelation(row.product_variants);
  if (!variant) return;
  const productMeta = unwrapRelation(variant.products);
  // Mix-system products have no inventory row — deduction routes to preset products via mix_composition path.
  if (productMeta?.status === "system") return;
  addGrams(totals, variant.product_id, (row.weight_g ?? 0) * row.quantity);
}

/** Aggregate grams per product across regular items and mix-composition entries. */
function aggregateGramsByProduct(items: DeductionItemRow[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of items) {
    if (row.mix_composition && row.mix_composition.length > 0) {
      addMixCompositionGrams(totals, row.mix_composition, row.quantity);
    } else {
      addRegularItemGrams(totals, row);
    }
  }
  return totals;
}

async function insertOrderMovements(
  orderId: string,
  totals: Map<string, number>,
) {
  const rows = Array.from(totals.entries()).map(([productId, grams]) => ({
    product_id: productId,
    delta_g: -grams,
    reason: "order_paid" as const,
    order_id: orderId,
  }));
  return await supabaseAdmin
    .from("stock_movements")
    .insert(rows)
    .select("product_id, delta_g");
}

/**
 * For each freshly-inserted movement, read previous stock, clamp `prev + delta`
 * to [0, ∞), UPSERT, and return the deducted product summary. Failed UPSERTs
 * are logged and silently skipped — the movement row is still in place, so a
 * follow-up admin action can reconcile.
 */
async function applyDeductedMovementsToInventory(
  insertedRows: InsertedMovement[],
): Promise<InventoryDeductionResult["deductedProducts"]> {
  const productIds = insertedRows.map((r) => r.product_id);

  const [{ data: prevInventory }, { data: products }] = await Promise.all([
    supabaseAdmin
      .from("product_inventory")
      .select("product_id, stock_g")
      .in("product_id", productIds),
    supabaseAdmin.from("products").select("id, title").in("id", productIds),
  ]);

  const prevMap = new Map(
    (prevInventory ?? []).map((r) => [r.product_id as string, r.stock_g as number]),
  );
  const titleMap = new Map(
    (products ?? []).map((p) => [p.id as string, p.title as string]),
  );

  const results = await Promise.all(
    insertedRows.map(async (row) => {
      const prev = prevMap.get(row.product_id) ?? 0;
      const next = Math.max(0, prev + row.delta_g);
      const { error } = await supabaseAdmin
        .from("product_inventory")
        .upsert(
          { product_id: row.product_id, stock_g: next },
          { onConflict: "product_id" },
        );
      if (error) {
        console.error(
          `Inventory upsert failed for product ${row.product_id}:`,
          error,
        );
        return null;
      }
      return {
        id: row.product_id,
        title: titleMap.get(row.product_id) ?? "—",
        new_stock_g: next,
      };
    }),
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

/**
 * Idempotent inventory deduction for a PAID order. Safe to call from both
 * the N-Genius webhook and the result-page settle path — UNIQUE(order_id, product_id)
 * on stock_movements ensures each (order, product) pair deducts exactly once.
 */
export async function deductInventoryForOrder(
  orderId: string,
): Promise<InventoryDeductionResult> {
  const { data: items, error: itemsError } =
    await loadOrderItemsForDeduction(orderId);

  if (itemsError) {
    return { deductedProducts: [], alreadyDeducted: false, error: itemsError.message };
  }
  if (!items || items.length === 0) {
    return { deductedProducts: [], alreadyDeducted: false };
  }

  const totals = aggregateGramsByProduct(items as unknown as DeductionItemRow[]);
  if (totals.size === 0) {
    return { deductedProducts: [], alreadyDeducted: false };
  }

  const { data: inserted, error: insertError } = await insertOrderMovements(
    orderId,
    totals,
  );

  if (insertError) {
    // Postgres unique_violation = 23505 — full set already deducted by another path.
    if (insertError.code === "23505") {
      return { deductedProducts: [], alreadyDeducted: true };
    }
    return { deductedProducts: [], alreadyDeducted: false, error: insertError.message };
  }

  const insertedRows = (inserted ?? []) as InsertedMovement[];
  if (insertedRows.length === 0) {
    return { deductedProducts: [], alreadyDeducted: true };
  }

  const deductedProducts = await applyDeductedMovementsToInventory(insertedRows);
  return { deductedProducts, alreadyDeducted: false };
}

// ============================================================================
// getProductCosts — dashboard COGS lookup
// ============================================================================

/** Batch cost lookup for the dashboard COGS calculation (mix composition entries). */
export async function getProductCosts(
  productIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (productIds.length === 0) return map;
  const unique = [...new Set(productIds)];
  const { data } = await supabaseAdmin
    .from("product_inventory")
    .select("product_id, cost_per_100g")
    .in("product_id", unique);
  for (const row of (data ?? []) as {
    product_id: string;
    cost_per_100g: string | number;
  }[]) {
    map.set(row.product_id, Number(row.cost_per_100g));
  }
  return map;
}

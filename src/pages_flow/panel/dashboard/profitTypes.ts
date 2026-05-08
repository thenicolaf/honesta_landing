import type { MixCompositionEntry } from "@/lib/orders";

export type ProfitRange = "today" | "7d" | "30d" | "month" | "all";
export const DEFAULT_PROFIT_RANGE: ProfitRange = "30d";
const ALL_RANGES: ProfitRange[] = ["today", "7d", "30d", "month", "all"];

export function isValidRange(value: string | undefined): value is ProfitRange {
  return !!value && (ALL_RANGES as string[]).includes(value);
}

/** Resolve a range key (or "all") to a millisecond cut-off — clients use this to filter rows. */
export function resolveRangeFromMs(
  range: ProfitRange,
  now: number = Date.now(),
): number | null {
  if (range === "all") return null;
  const d = new Date(now);
  if (range === "today") {
    d.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    d.setDate(d.getDate() - 7);
  } else if (range === "30d") {
    d.setDate(d.getDate() - 30);
  } else if (range === "month") {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.getTime();
}

export interface ProfitClientRow {
  /** Order updated_at (ms) — used for client-side range filtering. */
  paid_at: number;
  price: number;
  quantity: number;
  /** Regular item: source product_id (NULL for mix-system rows). */
  product_id: string | null;
  weight_g: number;
  /** Snapshot of regular product (only present when product_id != null). */
  product_name: string | null;
  product_image_url: string | null;
  /** Mix composition entries (each carries product_id + name + image + count + weight + price). */
  mix_composition: MixCompositionEntry[] | null;
}

export interface ProfitClientData {
  rows: ProfitClientRow[];
  /** product_id → cost_per_100g map for ALL product_ids referenced by `rows`. */
  costs: Record<string, number>;
}

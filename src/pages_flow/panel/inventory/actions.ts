"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import {
  getMovements,
  recordStockMovement,
  upsertInventorySettings,
  type StockMovement,
  type StockMovementReason,
} from "@/lib/inventoryDb";

const MANUAL_REASONS: StockMovementReason[] = [
  "restock",
  "correction",
  "damage",
  "manual_adjust",
];

async function requireAdmin(): Promise<{ userId?: string; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Admin access required" };
  return { userId: user.id };
}

// ── Adjust stock ─────────────────────────────────────────────────────

export interface AdjustStockState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    delta_g?: string;
    reason?: string;
  };
  values?: {
    delta_g?: string;
    reason?: string;
    note?: string;
  };
}

export async function adjustStockAction(
  productId: string,
  _prev: AdjustStockState | null,
  formData: FormData,
): Promise<AdjustStockState> {
  const rawDelta = (formData.get("delta_g") as string | null)?.trim() ?? "";
  const reason = (formData.get("reason") as string | null)?.trim() ?? "";
  const rawNote = ((formData.get("note") as string | null) ?? "").trim();

  const values = { delta_g: rawDelta, reason, note: rawNote };

  try {
    const note = rawNote;

    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error, values };

    const fieldErrors: AdjustStockState["fieldErrors"] = {};
    const delta = Number(rawDelta);
    if (!rawDelta || !Number.isFinite(delta) || !Number.isInteger(delta)) {
      fieldErrors.delta_g = "Enter a whole number of grams";
    } else if (delta === 0) {
      fieldErrors.delta_g = "Delta cannot be zero";
    }
    if (!MANUAL_REASONS.includes(reason as StockMovementReason)) {
      fieldErrors.reason = "Pick a reason";
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values };
    }

    const result = await recordStockMovement({
      productId,
      deltaG: delta,
      reason: reason as StockMovementReason,
      note: note || undefined,
      createdBy: auth.userId,
    });
    if (result.error) return { error: result.error, values };

    revalidatePath("/panel/inventory");
    return { success: true };
  } catch (err) {
    console.error("adjustStockAction error:", err);
    return {
      error:
        err instanceof Error
          ? `Stock update failed: ${err.message}`
          : "Something went wrong. Please try again.",
      values,
    };
  }
}

// ── Update inventory settings (cost + threshold) ─────────────────────

export interface UpdateInventorySettingsState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    cost_per_100g?: string;
    low_stock_threshold_g?: string;
  };
  values?: {
    cost_per_100g?: string;
    low_stock_threshold_g?: string;
  };
}

/**
 * Read-only fetch of last 50 movements. Auth is enforced by `proxy.ts` for
 * /panel/* — no extra admin check here keeps the round-trip lean.
 */
export async function loadMovementsAction(
  productId: string,
): Promise<{ movements: StockMovement[]; error?: string }> {
  try {
    const movements = await getMovements(productId, 50);
    return { movements };
  } catch (err) {
    console.error("loadMovementsAction error:", err);
    return {
      movements: [],
      error: err instanceof Error ? err.message : "Failed to load movements",
    };
  }
}

export async function updateInventorySettingsAction(
  productId: string,
  _prev: UpdateInventorySettingsState | null,
  formData: FormData,
): Promise<UpdateInventorySettingsState> {
  const rawCost =
    (formData.get("cost_per_100g") as string | null)?.trim() ?? "";
  const rawThreshold =
    (formData.get("low_stock_threshold_g") as string | null)?.trim() ?? "";

  const values = {
    cost_per_100g: rawCost,
    low_stock_threshold_g: rawThreshold,
  };

  try {
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error, values };

    const fieldErrors: UpdateInventorySettingsState["fieldErrors"] = {};
    const cost = Number(rawCost);
    const threshold = Number(rawThreshold);
    if (!rawCost || !Number.isFinite(cost) || cost < 0) {
      fieldErrors.cost_per_100g = "Enter a non-negative number";
    }
    if (
      !rawThreshold ||
      !Number.isFinite(threshold) ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      fieldErrors.low_stock_threshold_g =
        "Enter a non-negative whole number of grams";
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values };
    }

    const result = await upsertInventorySettings({
      productId,
      costPer100g: cost,
      lowStockThresholdG: threshold,
    });
    if (result.error) return { error: result.error, values };

    revalidatePath("/panel/inventory");
    revalidatePath("/panel/products");
    return { success: true };
  } catch (err) {
    console.error("updateInventorySettingsAction error:", err);
    return {
      error:
        err instanceof Error
          ? `Settings update failed: ${err.message}`
          : "Something went wrong. Please try again.",
      values,
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { updateDeliverySetting } from "@/lib/deliveryDb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmirateSettingValues {
  fee: number;
  threshold: number | null;
  minimum: number | null;
  days: number;
  is_active: boolean;
}

export interface EmirateSettingState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: EmirateSettingValues;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePositiveNumber(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const n = parseFloat(raw);
  return isNaN(n) || n < 0 ? NaN : n;
}

function parseIntOrDefault(raw: string | null, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const n = parseInt(raw);
  return isNaN(n) ? fallback : n;
}

function parseFormValues(formData: FormData): EmirateSettingValues {
  return {
    fee: parseFloat(formData.get("fee") as string),
    threshold: parsePositiveNumber(formData.get("threshold") as string),
    minimum: parsePositiveNumber(formData.get("minimum") as string),
    days: parseIntOrDefault(formData.get("days") as string, 1),
    is_active: formData.get("is_active") === "true",
  };
}

function validate(
  fee: number,
  threshold: number | null,
  minimum: number | null,
  days: number,
) {
  const fieldErrors: Record<string, string> = {};

  if (isNaN(fee) || fee < 0) {
    fieldErrors.fee = "Delivery fee must be a positive number";
  }
  if (threshold !== null && isNaN(threshold)) {
    fieldErrors.threshold = "Free delivery threshold must be a positive number";
  }
  if (minimum !== null && isNaN(minimum)) {
    fieldErrors.minimum = "Minimum order must be a positive number";
  }
  if (isNaN(days) || days < 0) {
    fieldErrors.days = "Delivery days must be 0 or more";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function saveEmirateSetting(
  id: string,
  _prevState: EmirateSettingState | null,
  formData: FormData,
): Promise<EmirateSettingState> {
  const values = parseFormValues(formData);

  const fieldErrors = validate(values.fee, values.threshold, values.minimum, values.days);
  if (fieldErrors) {
    return { fieldErrors, values };
  }

  const { error } = await updateDeliverySetting(id, {
    delivery_fee: values.fee,
    free_delivery_threshold: values.threshold,
    minimum_order: values.minimum,
    delivery_days: values.days,
    is_active: values.is_active,
  });

  if (error) {
    return { error: `Failed to save: ${error}`, values };
  }

  revalidatePath("/panel/delivery");
  revalidatePath("/cart");
  revalidatePath("/checkout");

  return { success: true };
}

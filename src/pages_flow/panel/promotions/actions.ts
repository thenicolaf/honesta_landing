"use server";

import { redirect } from "next/navigation";
import {
  createPromotion,
  updatePromotion,
  deletePromotion as deletePromotionDb,
} from "@/lib/promotionsDb";
import { supabaseAdmin } from "@/lib/supabase.server";
import { createNotification } from "@/lib/notificationsDb";
import { getPromotionStatus } from "./types";

interface PromotionValues {
  name: string;
  discount_type: string;
  discount_value: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids_raw: string;
}

export interface PromotionState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    discount_value?: string;
    starts_at?: string;
    ends_at?: string;
    product_ids?: string;
  };
  values?: PromotionValues;
}

function parseForm(formData: FormData) {
  return {
    name: (formData.get("name") as string)?.trim(),
    discount_type: (formData.get("discount_type") as string) || "percentage",
    discount_value: formData.get("discount_value") as string,
    starts_at: formData.get("starts_at") as string,
    ends_at: formData.get("ends_at") as string,
    is_active: formData.get("is_active") === "true",
    product_ids_raw: (formData.get("product_ids") as string)?.trim(),
  };
}

function validate(values: ReturnType<typeof parseForm>) {
  const fieldErrors: PromotionState["fieldErrors"] = {};

  if (!values.name) fieldErrors.name = "Name is required";

  const dv = parseFloat(values.discount_value);
  if (!values.discount_value || isNaN(dv) || dv <= 0) {
    fieldErrors.discount_value = "Must be a positive number";
  }
  if (values.discount_type === "percentage" && dv > 100) {
    fieldErrors.discount_value = "Percentage cannot exceed 100";
  }

  if (!values.starts_at) fieldErrors.starts_at = "Start date is required";
  if (!values.ends_at) fieldErrors.ends_at = "End date is required";

  if (
    values.starts_at &&
    values.ends_at &&
    values.ends_at <= values.starts_at
  ) {
    fieldErrors.ends_at = "End date must be after start date";
  }

  const productIds = parseProductIds(values.product_ids_raw);
  if (productIds.length === 0) {
    fieldErrors.product_ids = "Select at least one product";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

function parseProductIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function createPromotionAction(
  _prevState: PromotionState | null,
  formData: FormData,
): Promise<PromotionState> {
  const values = parseForm(formData);

  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const productIds = parseProductIds(values.product_ids_raw);

  const { error } = await createPromotion(
    {
      name: values.name,
      discount_type: values.discount_type as "percentage" | "fixed",
      discount_value: parseFloat(values.discount_value),
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      is_active: values.is_active,
    },
    productIds,
  );

  if (error) return { error, values };

  const startsAtIso = new Date(values.starts_at).toISOString();
  const endsAtIso = new Date(values.ends_at).toISOString();
  const newStatus = getPromotionStatus(
    values.is_active,
    startsAtIso,
    endsAtIso,
  );

  if (newStatus === "active") {
    await createNotification({
      type: "new_promotion",
      title: "New promotion",
      message: `${values.name} — ${values.discount_value}${values.discount_type === "percentage" ? "%" : " AED"} off`,
      audience: null,
    });
  }

  redirect("/panel/promotions?toast=created");
}

export async function updatePromotionAction(
  id: string,
  _prevState: PromotionState | null,
  formData: FormData,
): Promise<PromotionState> {
  const values = parseForm(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const productIds = parseProductIds(values.product_ids_raw);

  const { data: current } = await supabaseAdmin
    .from("promotions")
    .select("is_active, starts_at, ends_at")
    .eq("id", id)
    .single();

  const { error } = await updatePromotion(
    id,
    {
      name: values.name,
      discount_type: values.discount_type as "percentage" | "fixed",
      discount_value: parseFloat(values.discount_value),
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      is_active: values.is_active,
    },
    productIds,
  );

  if (error) return { error, values };

  const oldStatus = current
    ? getPromotionStatus(current.is_active, current.starts_at, current.ends_at)
    : null;
  const newStartsAtIso = new Date(values.starts_at).toISOString();
  const newEndsAtIso = new Date(values.ends_at).toISOString();
  const newStatus = getPromotionStatus(
    values.is_active,
    newStartsAtIso,
    newEndsAtIso,
  );

  if (newStatus === "active" && oldStatus !== "active") {
    await createNotification({
      type: "new_promotion",
      title: "New promotion",
      message: `${values.name} — ${values.discount_value}${values.discount_type === "percentage" ? "%" : " AED"} off`,
      audience: null,
    });
  }

  redirect("/panel/promotions?toast=updated");
}

export async function deletePromotionAction(
  id: string,
): Promise<{ error?: string }> {
  return deletePromotionDb(id);
}

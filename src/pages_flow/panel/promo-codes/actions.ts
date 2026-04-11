"use server";

import { redirect } from "next/navigation";
import {
  createPromoCode,
  updatePromoCode,
  deletePromoCode as deletePromoCodeDb,
} from "@/lib/promoCodesDb";
import { isValidPromoCodeFormat } from "@/shared/utils/promoCode";

interface PromoCodeValues {
  code: string;
  scope: string;
  discount_type: string;
  discount_value: string;
  min_order_amount: string;
  max_uses: string;
  max_uses_per_user: string;
  stack_with_promotions: boolean;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids_raw: string;
  user_ids_raw: string;
}

export interface PromoCodeState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    code?: string;
    discount_value?: string;
    min_order_amount?: string;
    max_uses?: string;
    max_uses_per_user?: string;
    starts_at?: string;
    ends_at?: string;
    product_ids?: string;
  };
  values?: PromoCodeValues;
}

function parseForm(formData: FormData): PromoCodeValues {
  return {
    code: ((formData.get("code") as string) ?? "").trim().toUpperCase(),
    scope: (formData.get("scope") as string) || "cart",
    discount_type: (formData.get("discount_type") as string) || "percentage",
    discount_value: (formData.get("discount_value") as string) ?? "",
    min_order_amount: (formData.get("min_order_amount") as string) ?? "",
    max_uses: (formData.get("max_uses") as string) ?? "",
    max_uses_per_user: (formData.get("max_uses_per_user") as string) ?? "",
    stack_with_promotions: formData.get("stack_with_promotions") === "true",
    starts_at: (formData.get("starts_at") as string) ?? "",
    ends_at: (formData.get("ends_at") as string) ?? "",
    is_active: formData.get("is_active") === "true",
    product_ids_raw: ((formData.get("product_ids") as string) ?? "").trim(),
    user_ids_raw: ((formData.get("user_ids") as string) ?? "").trim(),
  };
}

function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function parseOptionalInt(raw: string): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseOptionalNumber(raw: string): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function validate(values: PromoCodeValues) {
  const fieldErrors: PromoCodeState["fieldErrors"] = {};

  if (!values.code) {
    fieldErrors.code = "Code is required";
  } else if (!isValidPromoCodeFormat(values.code)) {
    fieldErrors.code = "Code must be exactly 6 characters (A-Z, 0-9)";
  }

  const dv = parseFloat(values.discount_value);
  if (!values.discount_value || isNaN(dv) || dv <= 0) {
    fieldErrors.discount_value = "Must be a positive number";
  }
  if (values.discount_type === "percentage" && dv > 100) {
    fieldErrors.discount_value = "Percentage cannot exceed 100";
  }

  if (values.min_order_amount.trim() !== "") {
    const m = parseFloat(values.min_order_amount);
    if (isNaN(m) || m < 0)
      fieldErrors.min_order_amount = "Must be a non-negative number";
  }

  if (values.max_uses.trim() !== "") {
    const m = parseInt(values.max_uses, 10);
    if (isNaN(m) || m < 1) fieldErrors.max_uses = "Must be a positive integer";
  }

  if (values.max_uses_per_user.trim() !== "") {
    const m = parseInt(values.max_uses_per_user, 10);
    if (isNaN(m) || m < 1)
      fieldErrors.max_uses_per_user = "Must be a positive integer";
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

  if (values.scope === "product") {
    const productIds = parseStringArray(values.product_ids_raw);
    if (productIds.length === 0) {
      fieldErrors.product_ids = "Select at least one product";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export async function createPromoCodeAction(
  _prevState: PromoCodeState | null,
  formData: FormData,
): Promise<PromoCodeState> {
  const values = parseForm(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const productIds =
    values.scope === "product" ? parseStringArray(values.product_ids_raw) : [];
  const userIds = parseStringArray(values.user_ids_raw);

  const { error } = await createPromoCode(
    {
      code: values.code,
      scope: values.scope as "cart" | "product",
      discount_type: values.discount_type as "percentage" | "fixed",
      discount_value: parseFloat(values.discount_value),
      min_order_amount: parseOptionalNumber(values.min_order_amount),
      max_uses: parseOptionalInt(values.max_uses),
      max_uses_per_user: parseOptionalInt(values.max_uses_per_user),
      stack_with_promotions: values.stack_with_promotions,
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      is_active: values.is_active,
    },
    productIds,
    userIds,
  );

  if (error) return { error, values };

  redirect("/panel/promo-codes?toast=created");
}

export async function updatePromoCodeAction(
  id: string,
  _prevState: PromoCodeState | null,
  formData: FormData,
): Promise<PromoCodeState> {
  const values = parseForm(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const productIds =
    values.scope === "product" ? parseStringArray(values.product_ids_raw) : [];
  const userIds = parseStringArray(values.user_ids_raw);

  const { error } = await updatePromoCode(
    id,
    {
      code: values.code,
      scope: values.scope as "cart" | "product",
      discount_type: values.discount_type as "percentage" | "fixed",
      discount_value: parseFloat(values.discount_value),
      min_order_amount: parseOptionalNumber(values.min_order_amount),
      max_uses: parseOptionalInt(values.max_uses),
      max_uses_per_user: parseOptionalInt(values.max_uses_per_user),
      stack_with_promotions: values.stack_with_promotions,
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      is_active: values.is_active,
    },
    productIds,
    userIds,
  );

  if (error) return { error, values };

  redirect("/panel/promo-codes?toast=updated");
}

export async function deletePromoCodeAction(
  id: string,
): Promise<{ error?: string }> {
  return deletePromoCodeDb(id);
}

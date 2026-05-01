"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createMarketingPopup,
  deleteMarketingPopup as deleteMarketingPopupDb,
  getMarketingPopupById,
  setMarketingPopupActive,
  updateMarketingPopup,
  type MarketingPopupInput,
} from "@/lib/marketingPopupDb";
import { deleteImage, uploadImage, type StorageBucket } from "@/lib/storage";
import { isHtmlEmpty, sanitizeNoteHtml } from "@/shared/utils/sanitizeHtml";

interface MarketingPopupValues {
  is_active: boolean;
  title: string;
  body: string;
  cta_label: string;
  cta_url: string;
  starts_at: string;
  ends_at: string;
}

export interface MarketingPopupState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    title?: string;
    cta_url?: string;
    starts_at?: string;
    ends_at?: string;
  };
  values?: MarketingPopupValues;
}

function isValidUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function resolveImageUrl(formData: FormData): Promise<string | null> {
  const entries = formData.getAll("image_url");
  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      const slug = (formData.get("image_url__slug") as string) || "popup";
      const bucket = ((formData.get("image_url__bucket") as string) ||
        "marketing") as StorageBucket;
      return uploadImage(entry, slug, bucket);
    }
    if (typeof entry === "string" && entry.trim()) {
      return entry.trim();
    }
  }
  return null;
}

function parseValues(formData: FormData): MarketingPopupValues {
  return {
    is_active: formData.get("is_active") === "true",
    title: ((formData.get("title") as string) ?? "").trim(),
    body: (formData.get("body") as string) ?? "",
    cta_label: ((formData.get("cta_label") as string) ?? "").trim(),
    cta_url: ((formData.get("cta_url") as string) ?? "").trim(),
    starts_at: ((formData.get("starts_at") as string) ?? "").trim(),
    ends_at: ((formData.get("ends_at") as string) ?? "").trim(),
  };
}

function validate(
  values: MarketingPopupValues,
): MarketingPopupState["fieldErrors"] | null {
  const fieldErrors: MarketingPopupState["fieldErrors"] = {};
  if (!values.title) fieldErrors.title = "Title is required";
  if (values.cta_url && !isValidUrl(values.cta_url)) {
    fieldErrors.cta_url =
      "Use an absolute URL (https://…) or a path starting with /";
  }
  if (values.starts_at && Number.isNaN(new Date(values.starts_at).getTime())) {
    fieldErrors.starts_at = "Invalid start date";
  }
  if (values.ends_at && Number.isNaN(new Date(values.ends_at).getTime())) {
    fieldErrors.ends_at = "Invalid end date";
  }
  if (
    values.starts_at &&
    values.ends_at &&
    new Date(values.ends_at) <= new Date(values.starts_at)
  ) {
    fieldErrors.ends_at = "End date must be after start date";
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

async function buildPayload(
  values: MarketingPopupValues,
  imageUrl: string | null,
): Promise<MarketingPopupInput> {
  return {
    is_active: values.is_active,
    title: values.title,
    body: isHtmlEmpty(values.body) ? "" : sanitizeNoteHtml(values.body),
    image_url: imageUrl,
    cta_label: values.cta_label || null,
    cta_url: values.cta_url || null,
    starts_at: values.starts_at
      ? new Date(values.starts_at).toISOString()
      : null,
    ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
  };
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createMarketingPopupAction(
  _prevState: MarketingPopupState | null,
  formData: FormData,
): Promise<MarketingPopupState> {
  const values = parseValues(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const imageUrl = await resolveImageUrl(formData);
    const payload = await buildPayload(values, imageUrl);

    const { error } = await createMarketingPopup(payload);
    if (error) return { error: `Failed to save: ${error}`, values };

    revalidatePath("/");
    revalidatePath("/panel/marketing-popup");
    redirect("/panel/marketing-popup?toast=created");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Create marketing popup error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateMarketingPopupAction(
  id: string,
  _prevState: MarketingPopupState | null,
  formData: FormData,
): Promise<MarketingPopupState> {
  const values = parseValues(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const newImageUrl = await resolveImageUrl(formData);
    const existing = await getMarketingPopupById(id);

    if (existing?.image_url && existing.image_url !== newImageUrl) {
      await deleteImage(existing.image_url, "marketing");
    }

    const payload = await buildPayload(values, newImageUrl);
    const { error } = await updateMarketingPopup(id, payload);
    if (error) return { error: `Failed to save: ${error}`, values };

    revalidatePath("/");
    revalidatePath("/panel/marketing-popup");
    redirect("/panel/marketing-popup?toast=updated");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Update marketing popup error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deleteMarketingPopupAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    const result = await deleteMarketingPopupDb(id);
    if (!result.error) {
      revalidatePath("/");
      revalidatePath("/panel/marketing-popup");
    }
    return result;
  } catch (err) {
    console.error("Delete marketing popup error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Activate / Deactivate ──────────────────────────────────────────────────

export async function activateMarketingPopupAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    const { error } = await setMarketingPopupActive(id, true);
    if (error) return { error };
    revalidatePath("/");
    revalidatePath("/panel/marketing-popup");
    return {};
  } catch (err) {
    console.error("Activate marketing popup error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deactivateMarketingPopupAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    const { error } = await setMarketingPopupActive(id, false);
    if (error) return { error };
    revalidatePath("/");
    revalidatePath("/panel/marketing-popup");
    return {};
  } catch (err) {
    console.error("Deactivate marketing popup error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

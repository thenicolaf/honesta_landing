"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase.server";
import { deleteImage } from "@/lib/storage";
import { buildNutrition } from "./product-form/nutrition";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductValues {
  title: string;
  tagline: string;
  price: string;
  weight_g: string;
  image_url: string;
  in_stock: string;
  category_id: string;
  tagIds: string;
  freeFromIds: string;
  occasionIds: string;
  servingIdeaIds: string;
  benefitIds: string;
  [key: string]: string;
}

export interface ProductState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    title?: string;
    price?: string;
    category_id?: string;
    images?: string;
  };
  values?: Partial<ProductValues>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function insertJunctionRows(
  productId: string,
  values: Partial<ProductValues>,
) {
  const tagIds = parseIds(values.tagIds ?? null);
  const freeFromIds = parseIds(values.freeFromIds ?? null);
  const occasionIds = parseIds(values.occasionIds ?? null);
  const servingIdeaIds = parseIds(values.servingIdeaIds ?? null);
  const benefitIds = parseIds(values.benefitIds ?? null);

  const inserts: PromiseLike<unknown>[] = [];

  if (tagIds.length)
    inserts.push(
      supabaseAdmin
        .from("product_tags")
        .insert(tagIds.map((tag_id) => ({ product_id: productId, tag_id }))),
    );

  if (freeFromIds.length)
    inserts.push(
      supabaseAdmin.from("product_free_froms").insert(
        freeFromIds.map((free_from_id) => ({
          product_id: productId,
          free_from_id,
        })),
      ),
    );

  if (occasionIds.length)
    inserts.push(
      supabaseAdmin.from("product_occasions").insert(
        occasionIds.map((occasion_id) => ({
          product_id: productId,
          occasion_id,
        })),
      ),
    );

  if (servingIdeaIds.length)
    inserts.push(
      supabaseAdmin.from("product_serving_ideas").insert(
        servingIdeaIds.map((serving_idea_id) => ({
          product_id: productId,
          serving_idea_id,
        })),
      ),
    );

  if (benefitIds.length)
    inserts.push(
      supabaseAdmin.from("product_benefits").insert(
        benefitIds.map((benefit_id) => ({
          product_id: productId,
          benefit_id,
        })),
      ),
    );

  await Promise.all(inserts);
}

async function deleteJunctionRows(productId: string) {
  await Promise.all([
    supabaseAdmin.from("product_tags").delete().eq("product_id", productId),
    supabaseAdmin
      .from("product_free_froms")
      .delete()
      .eq("product_id", productId),
    supabaseAdmin
      .from("product_occasions")
      .delete()
      .eq("product_id", productId),
    supabaseAdmin
      .from("product_serving_ideas")
      .delete()
      .eq("product_id", productId),
    supabaseAdmin.from("product_benefits").delete().eq("product_id", productId),
  ]);
}

function validateProduct(values: Partial<ProductValues>) {
  const fieldErrors: ProductState["fieldErrors"] = {};

  if (!values.title?.trim()) {
    fieldErrors.title = "Title is required";
  }

  if (!values.price?.trim() || isNaN(parseFloat(values.price!))) {
    fieldErrors.price = "Valid price is required";
  }

  if (!values.category_id?.trim()) {
    fieldErrors.category_id = "Category is required";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

function parseProductValues(
  values: Partial<ProductValues>,
  formData: FormData,
) {
  const title = values.title!.trim();

  return {
    slug: toSlug(title),
    title,
    tagline: values.tagline?.trim() || null,
    price: parseFloat(values.price!),
    weight_g: values.weight_g ? parseInt(values.weight_g) : null,
    image_url: values.image_url?.trim() || null,
    in_stock: values.in_stock === "true",
    category_id: values.category_id || null,
    nutrition: buildNutrition(formData),
  };
}

// ─── Status transitions ──────────────────────────────────────────────────────

function getAllowedTransitions(current: string): string[] {
  switch (current) {
    case "draft":
      return ["published", "archived"];
    case "published":
      return ["archived"];
    case "archived":
      return ["published"];
    default:
      return [];
  }
}

export async function updateProductStatus(
  id: string,
  newStatus: "draft" | "published" | "archived",
): Promise<Pick<ProductState, "success" | "error">> {
  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Product not found." };

  const allowed = getAllowedTransitions(existing.status);
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot change from ${existing.status} to ${newStatus}.` };
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "Failed to update status." };
  return { success: true };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProduct(
  _prevState: ProductState | null,
  formData: FormData,
): Promise<ProductState> {
  const values = Object.fromEntries(formData) as Partial<ProductValues>;

  const fieldErrors = validateProduct(values);
  if (fieldErrors) {
    return { fieldErrors, values };
  }

  const productData = parseProductValues(values, formData);
  const status = (formData.get("status") as string) || "draft";

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({ ...productData, status })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Failed to create product. Please try again.", values };
  }

  await insertJunctionRows(data.id, values);

  redirect("/panel/products");
}

export async function updateProduct(
  id: string,
  _prevState: ProductState | null,
  formData: FormData,
): Promise<ProductState> {
  const values = Object.fromEntries(formData) as Partial<ProductValues>;

  const fieldErrors = validateProduct(values);
  if (fieldErrors) {
    return { fieldErrors, values };
  }

  const productData = parseProductValues(values, formData);

  // Fetch old image URL to clean up if changed
  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      ...productData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update product. Please try again.", values };
  }

  // Delete old image from storage if it changed
  if (existing?.image_url && existing.image_url !== productData.image_url) {
    await deleteImage(existing.image_url, "products");
  }

  await deleteJunctionRows(id);
  await insertJunctionRows(id, values);

  redirect("/panel/products");
}

export async function deleteProduct(
  id: string,
): Promise<Pick<ProductState, "success" | "error">> {
  // Fetch image URL before deleting the row
  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) {
    return { error: "Failed to delete product. Please try again." };
  }

  if (existing?.image_url) {
    await deleteImage(existing.image_url, "products");
  }

  return { success: true };
}

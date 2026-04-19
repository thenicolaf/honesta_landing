"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase.server";
import { deleteImage, parseFormImages, type StorageBucket } from "@/lib/storage";
import { createNotification } from "@/lib/notificationsDb";
import type { NutritionJson } from "./product-form/nutrition";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantInput {
  weight_g: number;
  price: number;
}

interface ProductValues {
  title: string;
  tagline: string;
  note: string;
  variants: string;
  image_url: string;
  images: string;
  in_stock: string;
  mark: string;
  category_id: string;
  tagIds: string;
  freeFromIds: string;
  occasionIds: string;
  servingIdeaIds: string;
  benefitIds: string;
  ingredientIds: string;
  [key: string]: string;
}

export interface ProductState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    title?: string;
    variants?: string;
    category_id?: string;
    ingredientIds?: string;
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
  const ingredientIds = parseIds(values.ingredientIds ?? null);

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

  if (ingredientIds.length)
    inserts.push(
      supabaseAdmin.from("product_ingredients").insert(
        ingredientIds.map((ingredient_id) => ({
          product_id: productId,
          ingredient_id,
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
    supabaseAdmin.from("product_ingredients").delete().eq("product_id", productId),
  ]);
}

function parseVariants(raw: string | undefined): VariantInput[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function validateProduct(values: Partial<ProductValues>) {
  const fieldErrors: ProductState["fieldErrors"] = {};

  if (!values.title?.trim()) {
    fieldErrors.title = "Title is required";
  }

  const variants = parseVariants(values.variants);
  if (variants.length === 0) {
    fieldErrors.variants = "At least one variant is required";
  } else {
    const invalid = variants.some(
      (v) =>
        v.weight_g == null ||
        isNaN(v.weight_g) ||
        v.weight_g <= 0 ||
        v.price == null ||
        isNaN(v.price) ||
        v.price <= 0,
    );
    if (invalid) {
      fieldErrors.variants = "Each variant must have a valid weight and price";
    }
  }

  if (!values.category_id?.trim()) {
    fieldErrors.category_id = "Category is required";
  }

  if (parseIds(values.ingredientIds ?? null).length === 0) {
    fieldErrors.ingredientIds = "At least one ingredient is required";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

async function parseUploads(formData: FormData): Promise<{ image_url: string | null; images: string[] }> {
  const slug = (formData.get("images__slug") as string) || "product";
  const bucket = ((formData.get("images__bucket") as string) || "products") as StorageBucket;
  const all = await parseFormImages(formData, "images", slug, bucket);
  return { image_url: all[0] || null, images: all.slice(1) };
}

function collectAllUrls(
  imageUrl: string | null | undefined,
  images: string[] | null | undefined,
): string[] {
  return [
    ...(imageUrl ? [imageUrl] : []),
    ...((images as string[] | null) ?? []),
  ];
}

async function cleanupRemovedImages(
  oldUrls: string[],
  newUrls: string[],
) {
  const keep = new Set(newUrls);
  const removed = oldUrls.filter((url) => !keep.has(url));
  if (removed.length > 0) {
    await Promise.all(removed.map((url) => deleteImage(url, "products")));
  }
}

async function parseProductValues(
  values: Partial<ProductValues>,
  formData: FormData,
) {
  const title = values.title!.trim();
  const { image_url, images } = await parseUploads(formData);

  return {
    slug: toSlug(title),
    title,
    tagline: values.tagline?.trim() || null,
    note: values.note?.trim() || null,
    badge: values.badge?.trim() || null,
    image_url,
    images,
    in_stock: values.in_stock === "true",
    mark: values.mark || "new",
    category_id: values.category_id || null,
    nutrition: JSON.parse((formData.get("nutrition") as string) || "{}") as NutritionJson,
  };
}

async function syncVariants(productId: string, variants: VariantInput[]) {
  await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (variants.length > 0) {
    await supabaseAdmin.from("product_variants").insert(
      variants.map((v) => ({
        product_id: productId,
        weight_g: v.weight_g,
        price: v.price,
      })),
    );
  }
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
  try {
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

    if (newStatus === "published") {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("title")
        .eq("id", id)
        .single();
      await createNotification({
        type: "new_product",
        title: "New product available",
        message: product?.title ?? "",
        relatedId: id,
        audience: null,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Update product status error:", err);
    return { error: "Something went wrong. Please try again." };
  }
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

  try {
    const productData = await parseProductValues(values, formData);
    const status = (formData.get("status") as string) || "draft";
    const variants = parseVariants(values.variants);

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({ ...productData, status })
      .select("id")
      .single();

    if (error || !data) {
      return { error: "Failed to create product. Please try again.", values };
    }

    await Promise.all([
      insertJunctionRows(data.id, values),
      syncVariants(data.id, variants),
    ]);

    if (status === "published") {
      await createNotification({
        type: "new_product",
        title: "New product",
        message: productData.title,
        relatedId: data.id,
        audience: null,
      });
    }

    redirect("/panel/products?toast=created");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Create product error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
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

  try {
    const productData = await parseProductValues(values, formData);

    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("image_url, images")
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

    await cleanupRemovedImages(
      collectAllUrls(existing?.image_url, existing?.images as string[] | null),
      collectAllUrls(productData.image_url, productData.images),
    );

    const variants = parseVariants(values.variants);

    await deleteJunctionRows(id);
    await Promise.all([
      insertJunctionRows(id, values),
      syncVariants(id, variants),
    ]);

    redirect("/panel/products?toast=updated");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Update product error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function deleteProduct(
  id: string,
): Promise<Pick<ProductState, "success" | "error">> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("image_url, images")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) {
      return { error: "Failed to delete product. Please try again." };
    }

    await cleanupRemovedImages(
      collectAllUrls(existing?.image_url, existing?.images as string[] | null),
      [],
    );

    return { success: true };
  } catch (err) {
    console.error("Delete product error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

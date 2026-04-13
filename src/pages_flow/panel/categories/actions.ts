"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase.server";
import { deleteImage, uploadImage, type StorageBucket } from "@/lib/storage";
import { createNotification } from "@/lib/notificationsDb";
import { getMaxSortOrder, updateCategoryOrder } from "@/lib/categoriesDb";

interface CategoryInfo {
  name: string;
  audience: string;
  badge: string;
  tagline: string;
  description: string;
  image_url: string;
}

export interface CategoryState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
  };
  values?: Partial<CategoryInfo>;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function resolveImageUrl(formData: FormData): Promise<string | null> {
  const entry = formData.get("image_url");
  if (!entry) return null;
  if (typeof entry === "string") return entry.trim() || null;
  if (entry instanceof File && entry.size > 0) {
    const slug = (formData.get("image_url__slug") as string) || "category";
    const bucket = ((formData.get("image_url__bucket") as string) || "categories") as StorageBucket;
    return uploadImage(entry, slug, bucket);
  }
  return null;
}

export async function createCategory(
  _prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  const values = Object.fromEntries(formData) as Partial<CategoryInfo>;
  const fieldErrors: CategoryState["fieldErrors"] = {};
  if (!values.name?.trim()) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const name = values.name!.trim();

  try {
    const slug = toSlug(name);
    const imageUrl = await resolveImageUrl(formData);
    const maxOrder = await getMaxSortOrder();

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name,
        slug,
        audience: values.audience?.trim() || null,
        badge: values.badge?.trim() || null,
        tagline: values.tagline?.trim() || null,
        description: values.description?.trim() || null,
        image_url: imageUrl,
        sort_order: maxOrder + 1,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: "Failed to create category. Please try again.", values };
    }

    await createNotification({
      type: "new_category",
      title: "New category",
      message: name,
      relatedId: data.id,
      audience: null,
    });

    redirect("/panel/categories?toast=created");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Create category error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function updateCategory(
  id: string,
  _prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  const values = Object.fromEntries(formData) as Partial<CategoryInfo>;
  const fieldErrors: CategoryState["fieldErrors"] = {};
  if (!values.name?.trim()) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const name = values.name!.trim();

  try {
    const slug = toSlug(name);
    const newImageUrl = await resolveImageUrl(formData);

    const { data: existing } = await supabaseAdmin
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("categories")
      .update({
        name,
        slug,
        audience: values.audience?.trim() || null,
        badge: values.badge?.trim() || null,
        tagline: values.tagline?.trim() || null,
        description: values.description?.trim() || null,
        image_url: newImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { error: "Failed to update category. Please try again.", values };
    }

    if (existing?.image_url && existing.image_url !== newImageUrl) {
      await deleteImage(existing.image_url, "categories");
    }

    redirect("/panel/categories?toast=updated");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Update category error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function deleteCategory(
  id: string,
): Promise<Pick<CategoryState, "success" | "error">> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) return { error: "Failed to delete category. Please try again." };

    if (existing?.image_url) {
      await deleteImage(existing.image_url, "categories");
    }

    return { success: true };
  } catch (err) {
    console.error("Delete category error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<{ success?: boolean; error?: string }> {
  try {
    const ok = await updateCategoryOrder(orderedIds);
    if (!ok) return { error: "Failed to reorder categories." };
    revalidatePath("/panel/categories");
    return { success: true };
  } catch (err) {
    console.error("Reorder categories error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

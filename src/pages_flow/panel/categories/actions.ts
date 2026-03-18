"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase.server";
import { deleteImage } from "@/lib/storage";

interface CategoryInfo {
  name: string;
  audience: string;
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
  attempt?: number;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCategory(
  _prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  const values = Object.fromEntries(formData) as Partial<CategoryInfo>;
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const fieldErrors: CategoryState["fieldErrors"] = {};
  if (!values.name?.trim()) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values, attempt };

  const name = values.name!.trim();
  const slug = toSlug(name);

  const { error } = await supabaseAdmin.from("categories").insert({
    name,
    slug,
    audience: values.audience?.trim() || null,
    tagline: values.tagline?.trim() || null,
    description: values.description?.trim() || null,
    image_url: values.image_url?.trim() || null,
  });

  if (error) {
    return { error: "Failed to create category. Please try again.", values, attempt };
  }

  redirect("/panel/categories?toast=created");
}

export async function updateCategory(
  id: string,
  _prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  const values = Object.fromEntries(formData) as Partial<CategoryInfo>;
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const fieldErrors: CategoryState["fieldErrors"] = {};
  if (!values.name?.trim()) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values, attempt };

  const name = values.name!.trim();
  const slug = toSlug(name);
  const newImageUrl = values.image_url?.trim() || null;

  // Fetch old image URL to clean up if changed
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
      tagline: values.tagline?.trim() || null,
      description: values.description?.trim() || null,
      image_url: newImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update category. Please try again.", values, attempt };
  }

  // Delete old image from storage if it changed
  if (existing?.image_url && existing.image_url !== newImageUrl) {
    await deleteImage(existing.image_url, "categories");
  }

  redirect("/panel/categories?toast=updated");
}

export async function deleteCategory(
  id: string,
): Promise<Pick<CategoryState, "success" | "error">> {
  // Fetch image URL before deleting the row
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
}

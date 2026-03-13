"use server";

import { supabaseAdmin } from "@/lib/supabase.server";

interface CategoryInfo {
  name: string;
  audience: string;
  tagline: string;
  description: string;
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

export async function createCategory(
  _prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  const values = Object.fromEntries(formData) as Partial<CategoryInfo>;

  const fieldErrors: CategoryState["fieldErrors"] = {};
  if (!values.name?.trim()) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const name = values.name!.trim();
  const slug = toSlug(name);

  const { error } = await supabaseAdmin.from("categories").insert({
    name,
    slug,
    audience: values.audience?.trim() || null,
    tagline: values.tagline?.trim() || null,
    description: values.description?.trim() || null,
  });

  if (error) {
    return { error: "Failed to create category. Please try again.", values };
  }

  return { success: true, values };
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
  const slug = toSlug(name);

  const { error } = await supabaseAdmin
    .from("categories")
    .update({
      name,
      slug,
      audience: values.audience?.trim() || null,
      tagline: values.tagline?.trim() || null,
      description: values.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update category. Please try again.", values };
  }

  return { success: true, values };
}

export async function deleteCategory(
  id: string,
): Promise<Pick<CategoryState, "success" | "error">> {
  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: "Failed to delete category. Please try again." };
  return { success: true };
}

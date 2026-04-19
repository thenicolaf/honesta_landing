"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase.server";
import { deleteImage, uploadImage, type StorageBucket } from "@/lib/storage";
import {
  getMaxMixSortOrder,
  isMixSlugTaken,
} from "@/lib/mixBoxesDb";

interface PresetInput {
  product_id: string;
  weight_g: number;
  price: number;
}

interface MixValues {
  name: string;
  description: string;
  cell_count: string;
  is_active: string;
  presets: string;
  image_url: string;
}

export interface MixState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    cell_count?: string;
    presets?: string;
  };
  values?: Partial<MixValues>;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueMixSlug(base: string, excludeId?: string): Promise<string> {
  const seed = base || "mix";
  let candidate = seed;
  let suffix = 2;
  while (await isMixSlugTaken(candidate, excludeId)) {
    candidate = `${seed}-${suffix++}`;
    if (suffix > 1000) break;
  }
  return candidate;
}

function parsePresets(raw: string | undefined): PresetInput[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => ({
        product_id: typeof r?.product_id === "string" ? r.product_id : "",
        weight_g: Number(r?.weight_g),
        price: Number(r?.price),
      }))
      .filter((r) => r.product_id);
  } catch {
    return [];
  }
}

function validate(values: Partial<MixValues>): MixState["fieldErrors"] | null {
  const fieldErrors: MixState["fieldErrors"] = {};

  if (!values.name?.trim()) {
    fieldErrors.name = "Name is required";
  }

  const cellCount = Number(values.cell_count);
  if (!values.cell_count || isNaN(cellCount) || cellCount < 1 || cellCount > 50) {
    fieldErrors.cell_count = "Cell count must be between 1 and 50";
  }

  const presets = parsePresets(values.presets);
  if (presets.length === 0) {
    fieldErrors.presets = "At least one preset is required";
  } else {
    const invalid = presets.some(
      (p) =>
        !p.product_id ||
        isNaN(p.weight_g) ||
        p.weight_g <= 0 ||
        isNaN(p.price) ||
        p.price <= 0,
    );
    if (invalid) {
      fieldErrors.presets = "Each preset must have a product, weight > 0 and price ≥ 0";
    } else {
      const seen = new Set<string>();
      const hasDuplicate = presets.some((p) => {
        if (seen.has(p.product_id)) return true;
        seen.add(p.product_id);
        return false;
      });
      if (hasDuplicate) {
        fieldErrors.presets = "Each product can appear only once in the box";
      }
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

async function resolveImageUrl(formData: FormData): Promise<string | null> {
  const entries = formData.getAll("image_url");

  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      const slug = (formData.get("image_url__slug") as string) || "mix";
      const bucket = ((formData.get("image_url__bucket") as string) ||
        "mixes") as StorageBucket;
      return uploadImage(entry, slug, bucket);
    }
    if (typeof entry === "string" && entry.trim()) {
      return entry.trim();
    }
  }

  return null;
}

async function syncPresets(boxId: string, presets: PresetInput[]) {
  await supabaseAdmin.from("mix_box_presets").delete().eq("box_id", boxId);

  if (presets.length > 0) {
    await supabaseAdmin.from("mix_box_presets").insert(
      presets.map((p) => ({
        box_id: boxId,
        product_id: p.product_id,
        weight_g: p.weight_g,
        price: p.price,
      })),
    );
  }
}

export async function createMixAction(
  _prevState: MixState | null,
  formData: FormData,
): Promise<MixState> {
  const values = Object.fromEntries(formData) as Partial<MixValues>;

  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const name = values.name!.trim();
    const slug = await uniqueMixSlug(toSlug(name));
    const cellCount = Number(values.cell_count);
    const sortOrder = (await getMaxMixSortOrder()) + 1;
    const isActive = values.is_active === "true" || values.is_active === "on";
    const imageUrl = await resolveImageUrl(formData);
    const presets = parsePresets(values.presets);

    const sharedId = crypto.randomUUID();

    const { error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        id: sharedId,
        title: name,
        slug: `mix-${slug}`,
        image_url: imageUrl,
        status: "system",
        in_stock: true,
      });

    if (productError) {
      return { error: "Failed to create mix. Please try again.", values };
    }

    const { error } = await supabaseAdmin
      .from("mix_boxes")
      .insert({
        id: sharedId,
        name,
        slug,
        description: values.description?.trim() || null,
        image_url: imageUrl,
        cell_count: cellCount,
        is_active: isActive,
        sort_order: sortOrder,
      });

    if (error) {
      await supabaseAdmin.from("products").delete().eq("id", sharedId);
      return { error: "Failed to create mix. Please try again.", values };
    }

    const { error: presetsError } = await supabaseAdmin
      .from("mix_box_presets")
      .insert(
        presets.map((p) => ({
          box_id: sharedId,
          product_id: p.product_id,
          weight_g: p.weight_g,
          price: p.price,
        })),
      );

    if (presetsError) {
      await supabaseAdmin.from("mix_boxes").delete().eq("id", sharedId);
      await supabaseAdmin.from("products").delete().eq("id", sharedId);
      return {
        error: "Failed to save presets. Please try again.",
        fieldErrors: { presets: "Each product can appear only once in the box" },
        values,
      };
    }

    redirect("/panel/mixes?toast=created");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Create mix error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function updateMixAction(
  id: string,
  _prevState: MixState | null,
  formData: FormData,
): Promise<MixState> {
  const values = Object.fromEntries(formData) as Partial<MixValues>;

  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  try {
    const name = values.name!.trim();
    const cellCount = Number(values.cell_count);
    const isActive = values.is_active === "true" || values.is_active === "on";
    const presets = parsePresets(values.presets);
    const newImageUrl = await resolveImageUrl(formData);

    const { data: existing } = await supabaseAdmin
      .from("mix_boxes")
      .select("name, slug, image_url")
      .eq("id", id)
      .single();

    const slug =
      existing && existing.name === name
        ? existing.slug
        : await uniqueMixSlug(toSlug(name), id);

    const updatePayload: Record<string, unknown> = {
      name,
      slug,
      description: values.description?.trim() || null,
      image_url: newImageUrl,
      cell_count: cellCount,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("mix_boxes")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { error: "Failed to update mix. Please try again.", values };
    }

    await supabaseAdmin
      .from("products")
      .update({
        title: name,
        slug: `mix-${slug}`,
        image_url: newImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (
      existing?.image_url &&
      existing.image_url !== newImageUrl
    ) {
      await deleteImage(existing.image_url, "mixes");
    }

    await syncPresets(id, presets);

    redirect("/panel/mixes?toast=updated");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Update mix error:", err);
    return { error: "Something went wrong. Please try again.", values };
  }
}

export async function deleteMixAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("mix_boxes")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("mix_boxes")
      .delete()
      .eq("id", id);

    if (error) return { error: "Failed to delete mix. Please try again." };

    await supabaseAdmin.from("products").delete().eq("id", id);

    if (existing?.image_url) {
      await deleteImage(existing.image_url, "mixes");
    }

    return { success: true };
  } catch (err) {
    console.error("Delete mix error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function reorderMixesAction(
  orderedIds: string[],
): Promise<{ success?: boolean; error?: string }> {
  try {
    const updates = orderedIds.map((id, index) =>
      supabaseAdmin
        .from("mix_boxes")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id),
    );
    await Promise.all(updates);
    revalidatePath("/panel/mixes");
    return { success: true };
  } catch (err) {
    console.error("Reorder mixes error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function toggleMixActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("mix_boxes")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: "Failed to update status. Please try again." };
    return { success: true };
  } catch (err) {
    console.error("Toggle mix active error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

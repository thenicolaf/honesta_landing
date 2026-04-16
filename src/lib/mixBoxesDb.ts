import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase.server";

export interface MixPresetProductRef {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  category: { id: string; slug: string; name: string } | null;
}

export interface MixPreset {
  id: string;
  product_id: string;
  weight_g: number;
  price: number;
  product: MixPresetProductRef | null;
}

export interface MixBox {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  cell_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  presets: MixPreset[];
}

const MIX_SELECT = `
  id, name, slug, description, image_url, cell_count,
  is_active, sort_order, created_at, updated_at,
  presets:mix_box_presets(
    id, product_id, weight_g, price,
    product:products(
      id, title, slug, image_url,
      category:categories(id, slug, name)
    )
  )
`;

export const getMixBoxes = cache(async (): Promise<MixBox[]> => {
  const { data, error } = await supabaseAdmin
    .from("mix_boxes")
    .select(MIX_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as MixBox[];
});

export const getMixBoxById = cache(async (id: string): Promise<MixBox | null> => {
  const { data, error } = await supabaseAdmin
    .from("mix_boxes")
    .select(MIX_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as MixBox;
});

export const getActiveMixBoxBySlug = cache(
  async (slug: string): Promise<MixBox | null> => {
    const { data, error } = await supabase
      .from("mix_boxes")
      .select(MIX_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return data as unknown as MixBox;
  },
);

export interface MixProductOption {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  category_name: string | null;
}

export interface MixFormOptions {
  products: MixProductOption[];
}

export const getMixFormOptions = cache(async (): Promise<MixFormOptions> => {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, title, slug, image_url, categories(name)")
    .eq("status", "published")
    .order("title", { ascending: true });

  const rows = (data ?? []) as unknown as {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    categories: { name: string } | null;
  }[];

  return {
    products: rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      image_url: p.image_url,
      category_name: p.categories?.name ?? null,
    })),
  };
});

export async function getMaxMixSortOrder(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("mix_boxes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.sort_order ?? 0;
}

export async function isMixSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabaseAdmin.from("mix_boxes").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !!data;
}

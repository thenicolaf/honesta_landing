import { supabase, supabaseAdmin } from "@/lib/supabase.server";
import type { DbProduct } from "@/sections/products/types/db-types";

const PRODUCTS_SELECT = `
  *,
  categories(id, slug, name),
  product_tags(tag_id, tag_options(id, label)),
  product_free_froms(free_from_id, free_from_options(id, label)),
  product_serving_ideas(serving_idea_id, serving_idea_options(id, label)),
  product_occasions(occasion_id, occasion_options(id, label)),
  product_benefits(benefit_id, benefits(id, name, description)),
  promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active)),
  product_variants(id, weight_g, price)
`;

export type AdminDbProduct = Omit<
  DbProduct,
  | "categories"
  | "product_tags"
  | "product_free_froms"
  | "product_serving_ideas"
  | "product_occasions"
  | "product_benefits"
> & {
  categories: { id: string; slug: string; name: string } | null;
  product_tags: { tag_id: number; tag_options: { id: number; label: string } }[];
  product_free_froms: { free_from_id: number; free_from_options: { id: number; label: string } }[];
  product_serving_ideas: { serving_idea_id: number; serving_idea_options: { id: number; label: string } }[];
  product_occasions: { occasion_id: number; occasion_options: { id: number; label: string } }[];
  product_benefits: { benefit_id: number; benefits: { id: number; name: string; description: string } }[];
};

const PUBLIC_PRODUCTS_SELECT = `
  *,
  categories(slug, name),
  product_tags(tag_options(label)),
  product_free_froms(free_from_options(label)),
  product_serving_ideas(serving_idea_options(label)),
  product_occasions(occasion_options(label)),
  product_benefits(benefits(name, description)),
  promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active)),
  product_variants(id, weight_g, price)
`;

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_PRODUCTS_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data as DbProduct;
}

export async function getPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const { data } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  return (data ?? []) as { slug: string; updated_at: string }[];
}

export async function getAdminProductById(id: string): Promise<AdminDbProduct | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(PRODUCTS_SELECT)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as AdminDbProduct;
}

interface AdminProductsFilter {
  status?: string;
  category?: string;
}

export async function getAdminProducts(
  filter?: AdminProductsFilter,
): Promise<AdminDbProduct[]> {
  let query = supabaseAdmin
    .from("products")
    .select(PRODUCTS_SELECT);

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  if (filter?.category) {
    query = query.eq("categories.slug", filter.category);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error || !data) return [];

  const products = data as AdminDbProduct[];

  if (filter?.category) {
    return products.filter((p) => p.categories?.slug === filter.category);
  }

  return products;
}

export interface ProductFormOptions {
  categories: { id: string; name: string; slug: string }[];
  tagOptions: { id: number; label: string }[];
  freeFromOptions: { id: number; label: string }[];
  occasionOptions: { id: number; label: string }[];
  servingIdeaOptions: { id: number; label: string }[];
  benefits: { id: number; name: string; description: string }[];
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, tagOptions, freeFromOptions, occasionOptions, servingIdeaOptions, benefits] =
    await Promise.all([
      supabaseAdmin.from("categories").select("id, name, slug").order("name"),
      supabaseAdmin.from("tag_options").select("id, label").order("label"),
      supabaseAdmin.from("free_from_options").select("id, label").order("label"),
      supabaseAdmin.from("occasion_options").select("id, label").order("label"),
      supabaseAdmin.from("serving_idea_options").select("id, label").order("label"),
      supabaseAdmin.from("benefits").select("id, name, description").order("name"),
    ]);

  return {
    categories: (categories.data ?? []) as { id: string; name: string; slug: string }[],
    tagOptions: (tagOptions.data ?? []) as { id: number; label: string }[],
    freeFromOptions: (freeFromOptions.data ?? []) as { id: number; label: string }[],
    occasionOptions: (occasionOptions.data ?? []) as { id: number; label: string }[],
    servingIdeaOptions: (servingIdeaOptions.data ?? []) as { id: number; label: string }[],
    benefits: (benefits.data ?? []) as { id: number; name: string; description: string }[],
  };
}

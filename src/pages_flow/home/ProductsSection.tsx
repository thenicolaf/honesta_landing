import { ProductGrid } from "@/sections";
import { supabase } from "@/lib/supabase.server";
import { getCategories } from "@/lib/categoriesDb";
import { getProductSalesMap } from "@/lib/productsDb";
import type { DbProduct } from "@/sections/products/types/db-types";

const RELATIONS = `product_tags(tag_options(label)),
    product_free_froms(free_from_options(label)),
    product_serving_ideas(serving_idea_options(label)),
    product_occasions(occasion_options(label)),
    product_benefits(benefits(name, description)),
    product_ingredients(ingredient_options(label)),
    promotion_products(promotions(name, discount_type, discount_value, starts_at, ends_at, is_active)),
    product_variants(id, weight_g, price)`;

export async function ProductsSection() {
  const [{ data }, categories, salesMap] = await Promise.all([
    supabase
      .from("products")
      .select(`*, categories(slug, name), ${RELATIONS}`)
      .eq("status", "published")
      .order("created_at"),
    getCategories(),
    getProductSalesMap(),
  ]);

  return (
    <ProductGrid
      rawProducts={(data as DbProduct[] | null) ?? []}
      categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
      salesMap={salesMap}
    />
  );
}

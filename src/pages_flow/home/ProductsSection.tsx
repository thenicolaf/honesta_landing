import { ProductGrid } from "@/sections";
import { supabase } from "@/lib/supabase.server";

export async function ProductsSection() {
  const { data: productsData } = await supabase
    .from("products")
    .select(
      `*, categories(slug),
      product_tags(tag_options(label)),
      product_free_froms(free_from_options(label)),
      product_serving_ideas(serving_idea_options(label)),
      product_occasions(occasion_options(label)),
      product_benefits(benefits(name, description))`,
    )
    .order("created_at");

  return <ProductGrid rawProducts={productsData ?? []} />;
}

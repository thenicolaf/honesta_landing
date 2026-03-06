import { ProductGrid } from "@/sections";
import { supabase } from "@/lib/supabase.server";

export async function ProductsSection() {
  const [
    { data: productsData },
    { data: tagOptionsData },
    { data: freeFromOptionsData },
    { data: servingIdeaOptionsData },
    { data: occasionOptionsData },
    { data: benefitsData },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name, slug)")
      .order("created_at"),
    supabase.from("tag_options").select("id, label"),
    supabase.from("free_from_options").select("id, label"),
    supabase.from("serving_idea_options").select("id, label"),
    supabase.from("occasion_options").select("id, label"),
    supabase.from("benefits").select("id, name, description"),
  ]);

  return (
    <ProductGrid
      rawProducts={productsData ?? []}
      tagOptions={tagOptionsData ?? []}
      freeFromOptions={freeFromOptionsData ?? []}
      servingIdeaOptions={servingIdeaOptionsData ?? []}
      occasionOptions={occasionOptionsData ?? []}
      benefits={benefitsData ?? []}
    />
  );
}

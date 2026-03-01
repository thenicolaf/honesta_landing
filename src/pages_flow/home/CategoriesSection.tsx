import { CategoryGrid } from "@/sections";
import { supabase } from "@/lib/supabase";
import type { DbCategory } from "@/sections/categories";

export async function CategoriesSection() {
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, badge, audience, tagline, description");

  return (
    <CategoryGrid categories={(data as DbCategory[] | null) ?? undefined} />
  );
}

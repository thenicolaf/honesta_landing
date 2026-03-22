import { CategoryGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";

export async function CategoriesSection() {
  const categories = await getCategories();

  return <CategoryGrid categories={categories} />;
}

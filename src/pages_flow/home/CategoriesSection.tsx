import { CategoryGrid } from "@/sections";
import { getCategories, getCategoryProductCountMap } from "@/lib/categoriesDb";

export async function CategoriesSection() {
  const [categories, productCountMap] = await Promise.all([
    getCategories(),
    getCategoryProductCountMap(),
  ]);
  return (
    <CategoryGrid categories={categories} productCountMap={productCountMap} />
  );
}

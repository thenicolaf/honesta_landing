import { CategoryGrid } from "@/sections";
import { getCategories } from "@/lib/categoriesDb";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { readViewModeCookie } from "@/shared/utils/readViewModeCookie";
import { CATEGORIES_VIEW_COOKIE } from "@/shared/consts";

export async function CategoriesSection() {
  const [categories, initialMode] = await Promise.all([
    getCategories(),
    readViewModeCookie(CATEGORIES_VIEW_COOKIE),
  ]);

  return (
    <ViewModeProvider
      cookieKey={CATEGORIES_VIEW_COOKIE}
      initialMode={initialMode}
    >
      <CategoryGrid categories={categories} />
    </ViewModeProvider>
  );
}

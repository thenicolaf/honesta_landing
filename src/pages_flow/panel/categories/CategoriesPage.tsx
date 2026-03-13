import { getCategories } from "@/lib/categoriesDb";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryActionsProvider } from "./CategoryActionsProvider";
import { AdminCategoryCard } from "./AdminCategoryCard";

export async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <CategoryActionsProvider>
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
          Admin Panel
        </p>
        <CategoryFormDialog />
      </div>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Categories
      </h1>

      {categories.length === 0 ? (
        <p className="font-body font-light text-earth/50 text-sm">
          No categories yet. Create one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ">
          {categories.map((category) => (
            <AdminCategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </CategoryActionsProvider>
  );
}

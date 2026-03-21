import { Plus } from "lucide-react";
import { Button, EmptyState, ToastFromUrl } from "@/shared/ui";
import { getCategories } from "@/lib/categoriesDb";
import { CategoryActionsProvider } from "./CategoryActionsProvider";
import { SortableCategoryGrid } from "./SortableCategoryGrid";

export async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <CategoryActionsProvider>
      <ToastFromUrl />
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
          Admin Panel
        </p>
        <Button
          as="a"
          href="/panel/categories/create"
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} aria-hidden="true" />}
        >
          New Category
        </Button>
      </div>
      <h1
        className="font-display font-bold italic text-heading mb-6 leading-tight"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
      >
        Categories
      </h1>

      {categories.length === 0 ? (
        <EmptyState
          label="No categories yet"
          description="Create one to get started."
          action={{
            label: "New Category",
            href: "/panel/categories/create",
            variant: "primary",
          }}
        />
      ) : (
        <SortableCategoryGrid categories={categories} />
      )}
    </CategoryActionsProvider>
  );
}

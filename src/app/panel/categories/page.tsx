import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, EmptyState, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getCategories } from "@/lib/categoriesDb";
import { CategoryActionsProvider } from "@/pages_flow/panel/categories/CategoryActionsProvider";
import { SortableCategoryGrid } from "@/pages_flow/panel/categories/SortableCategoryGrid";
import { CategoryGridSkeleton } from "@/sections";

async function CategoriesContent() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <EmptyState
        label="No categories yet"
        description="Create one to get started."
        action={{
          label: "New Category",
          href: "/panel/categories/create",
          variant: "primary",
        }}
      />
    );
  }

  return <SortableCategoryGrid categories={categories} />;
}

export default function AdminCategoriesPage() {
  return (
    <CategoryActionsProvider>
      <ToastFromUrl />
      <AdminPageHeader
        title="Categories"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/categories/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} aria-hidden="true" />}
          >
            New Category
          </Button>
        }
      />

      <Suspense fallback={<CategoryGridSkeleton variant="admin" count={4} />}>
        <CategoriesContent />
      </Suspense>
    </CategoryActionsProvider>
  );
}

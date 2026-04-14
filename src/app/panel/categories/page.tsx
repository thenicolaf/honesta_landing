import { Suspense } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  EmptyState,
  ToastFromUrl,
  ViewModeToggle,
} from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getCategories } from "@/lib/categoriesDb";
import { CategoryActionsProvider } from "@/pages_flow/panel/categories/CategoryActionsProvider";
import { SortableCategoryGrid } from "@/pages_flow/panel/categories/SortableCategoryGrid";
import { ViewModeProvider, type ViewMode } from "@/providers/ViewModeProvider";
import { readViewModeCookie } from "@/shared/utils/readViewModeCookie";
import { CATEGORIES_VIEW_COOKIE } from "@/shared/consts";
import { CategoryGridSkeleton } from "@/sections";

const ADMIN_GRID_CLASS: Record<ViewMode, string> = {
  card: "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  row: "grid grid-cols-1 gap-4 sm:gap-5 2xl:grid-cols-2 2xl:gap-6",
};

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

export default async function AdminCategoriesPage() {
  const initialMode = await readViewModeCookie(CATEGORIES_VIEW_COOKIE);

  return (
    <CategoryActionsProvider>
      <ViewModeProvider
        cookieKey={CATEGORIES_VIEW_COOKIE}
        initialMode={initialMode}
      >
        <ToastFromUrl />
        <AdminPageHeader
          title="Categories"
          label="Admin Panel"
          actions={
            <div className="flex items-center gap-3">
              <ViewModeToggle />
              <Button
                href="/panel/categories/create"
                variant="primary"
                size="sm"
                startIcon={<Plus size={14} aria-hidden="true" />}
              >
                New Category
              </Button>
            </div>
          }
        />

        <Suspense
          fallback={
            <CategoryGridSkeleton
              mode={initialMode}
              gridClassName={ADMIN_GRID_CLASS[initialMode]}
              count={4}
            />
          }
        >
          <CategoriesContent />
        </Suspense>
      </ViewModeProvider>
    </CategoryActionsProvider>
  );
}

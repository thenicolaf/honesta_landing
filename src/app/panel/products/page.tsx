import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, ToastFromUrl, ViewModeToggle } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getAdminProducts, getProductFormOptions } from "@/lib/productsDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductActionsProvider } from "@/pages_flow/panel/products/ProductActionsProvider";
import { ProductsPageInner } from "@/pages_flow/panel/products/ProductsPage";
import { ViewModeProvider } from "@/providers/ViewModeProvider";
import { readViewModeCookie } from "@/shared/utils/readViewModeCookie";
import { PRODUCTS_VIEW_COOKIE } from "@/shared/consts";
import { ProductGridSkeleton } from "@/sections/products";

async function ProductsContent() {
  const [products, { categories }] = await Promise.all([
    getAdminProducts(),
    getProductFormOptions(),
  ]);

  return (
    <SearchParamsFilterProvider
      keys={["status", "category", "sort", "search", "mark"]}
    >
      <ProductsPageInner
        products={products}
        categoryItems={categories.map((c) => ({ value: c.slug, label: c.name }))}
      />
    </SearchParamsFilterProvider>
  );
}

export default async function AdminProductsPage() {
  const initialMode = await readViewModeCookie(PRODUCTS_VIEW_COOKIE);

  return (
    <ProductActionsProvider>
      <ViewModeProvider
        cookieKey={PRODUCTS_VIEW_COOKIE}
        initialMode={initialMode}
      >
        <ToastFromUrl />
        <AdminPageHeader
          title="Products"
          label="Admin Panel"
          actions={
            <div className="flex items-center gap-3">
              <ViewModeToggle />
              <Button
                href="/panel/products/create"
                variant="primary"
                size="sm"
                startIcon={<Plus size={14} aria-hidden="true" />}
              >
                New Product
              </Button>
            </div>
          }
        />

        <Suspense
          fallback={<ProductGridSkeleton mode={initialMode} count={8} />}
        >
          <ProductsContent />
        </Suspense>
      </ViewModeProvider>
    </ProductActionsProvider>
  );
}

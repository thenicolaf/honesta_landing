import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, SkeletonProductGrid, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getAdminProducts, getProductFormOptions } from "@/lib/productsDb";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { ProductActionsProvider } from "@/pages_flow/panel/products/ProductActionsProvider";
import { ProductsPageInner } from "@/pages_flow/panel/products/ProductsPage";

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

export default function AdminProductsPage() {
  return (
    <ProductActionsProvider>
      <ToastFromUrl />
      <AdminPageHeader
        title="Products"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/products/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} aria-hidden="true" />}
          >
            New Product
          </Button>
        }
      />

      <Suspense fallback={<SkeletonProductGrid count={8} />}>
        <ProductsContent />
      </Suspense>
    </ProductActionsProvider>
  );
}

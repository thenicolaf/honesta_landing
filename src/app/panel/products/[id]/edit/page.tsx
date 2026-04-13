import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Skeleton } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getAdminProductById, getProductFormOptions } from "@/lib/productsDb";
import { ProductForm } from "@/pages_flow/panel/products/ProductForm";

async function EditContent({ id }: { id: string }) {
  const [product, options] = await Promise.all([
    getAdminProductById(id),
    getProductFormOptions(),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} options={options} />;
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <div className="mb-6">
        <Button
          href="/panel/products"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to products
        </Button>
      </div>

      <AdminPageHeader title="Edit Product" label="Admin Panel" />

      <Suspense fallback={<FormSkeleton />}>
        <EditContent id={id} />
      </Suspense>
    </>
  );
}

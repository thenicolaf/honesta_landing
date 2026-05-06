import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/shared/ui";
import { getAdminProductById } from "@/lib/productsDb";
import { ProductDetailPage } from "@/pages_flow/panel/products/ProductDetailPage";
import { isSafeBackHref } from "@/shared/utils/backHref";

async function DetailContent({ id, back }: { id: string; back?: string }) {
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const safeBack = isSafeBackHref(back) ? back : undefined;

  return (
    <ProductDetailPage
      product={product}
      {...(safeBack ? { backHref: safeBack } : {})}
    />
  );
}

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-40 rounded-full mb-6" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-9 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-3/2 w-full rounded-[16px]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-32" />
          <div className="flex flex-col gap-2 mt-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailContent id={id} back={back} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { getPromoCodeById } from "@/lib/promoCodesDb";
import { PromoCodeForm } from "@/pages_flow/panel/promo-codes/PromoCodeForm";
import { loadProductOptions, loadUserOptions } from "../../_data";

async function EditContent({ id }: { id: string }) {
  const [promoCode, products, users] = await Promise.all([
    getPromoCodeById(id),
    loadProductOptions(),
    loadUserOptions(),
  ]);

  if (!promoCode) notFound();

  return <PromoCodeForm promoCode={promoCode} products={products} users={users} />;
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }, (_, i) => (
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
      <AdminPageHeader title="Edit Promo Code" label="Admin Panel" />
      <Suspense fallback={<FormSkeleton />}>
        <EditContent id={id} />
      </Suspense>
    </>
  );
}

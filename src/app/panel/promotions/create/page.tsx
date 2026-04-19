import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { getPromotionProductOptions } from "@/lib/promotionsDb";
import { PromotionForm } from "@/pages_flow/panel/promotions/PromotionForm";

async function CreateContent() {
  const products = await getPromotionProductOptions();
  return <PromotionForm products={products} />;
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

export default function Page() {
  return (
    <>
      <AdminPageHeader title="New Promotion" label="Admin Panel" />
      <Suspense fallback={<FormSkeleton />}>
        <CreateContent />
      </Suspense>
    </>
  );
}

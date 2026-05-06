import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Button, Skeleton } from "@/shared/ui";
import { PromoCodeForm } from "@/pages_flow/panel/promo-codes/PromoCodeForm";
import { loadProductOptions, loadUserOptions } from "../_data";

async function CreateContent() {
  const [products, users] = await Promise.all([
    loadProductOptions(),
    loadUserOptions(),
  ]);
  return <PromoCodeForm products={products} users={users} />;
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
      <div className="mb-6">
        <Button
          href="/panel/promo-codes"
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft size={14} />}
        >
          Back to promo codes
        </Button>
      </div>

      <AdminPageHeader title="New Promo Code" label="Admin Panel" />
      <Suspense fallback={<FormSkeleton />}>
        <CreateContent />
      </Suspense>
    </>
  );
}

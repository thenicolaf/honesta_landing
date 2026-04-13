import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, SkeletonGrid, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getPromoCodes } from "@/lib/promoCodesDb";
import { PromoCodeList } from "@/pages_flow/panel/promo-codes/PromoCodesPage";

async function PromoCodesContent() {
  const promoCodes = await getPromoCodes();
  return <PromoCodeList promoCodes={promoCodes} />;
}

export default function Page() {
  return (
    <>
      <ToastFromUrl />
      <AdminPageHeader
        title="Promo Codes"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/promo-codes/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} />}
          >
            New Promo Code
          </Button>
        }
      />

      <Suspense fallback={<SkeletonGrid count={6} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />}>
        <PromoCodesContent />
      </Suspense>
    </>
  );
}

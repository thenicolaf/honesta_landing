import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, SkeletonGrid, ToastFromUrl } from "@/shared/ui";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { getPromotions } from "@/lib/promotionsDb";
import { PromotionList } from "@/pages_flow/panel/promotions/PromotionsPage";

async function PromotionsContent() {
  const promotions = await getPromotions();
  return <PromotionList promotions={promotions} />;
}

export default function Page() {
  return (
    <>
      <ToastFromUrl />
      <AdminPageHeader
        title="Promotions"
        label="Admin Panel"
        actions={
          <Button
            href="/panel/promotions/create"
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} />}
          >
            New Promotion
          </Button>
        }
      />

      <Suspense fallback={<SkeletonGrid count={6} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />}>
        <PromotionsContent />
      </Suspense>
    </>
  );
}

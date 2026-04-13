import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { SkeletonGrid, DeliveryInfo } from "@/shared/ui";
import { formatDeliveryDaysRange } from "@/shared/utils/calculateDelivery";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { EmirateCard } from "@/pages_flow/panel/delivery/EmirateCard";

async function DeliveryContent() {
  const settings = await getDeliverySettings();

  return (
    <>
      <div className="mb-6 rounded-xl bg-sand/50 px-4 py-3">
        <DeliveryInfo label={formatDeliveryDaysRange(settings)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settings.map((s) => (
          <EmirateCard key={s.id} setting={s} />
        ))}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Delivery Settings" label="Admin Panel" />
      <Suspense fallback={<SkeletonGrid count={7} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />}>
        <DeliveryContent />
      </Suspense>
    </>
  );
}

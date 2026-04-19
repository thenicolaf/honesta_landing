import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DeliveryInfo } from "@/shared/ui";
import { formatDeliveryDaysRange } from "@/shared/utils/calculateDelivery";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { EmirateCard } from "@/pages_flow/panel/delivery/EmirateCard";
import { DeliverySkeleton } from "@/pages_flow/panel/delivery/DeliverySkeleton";

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
      <Suspense fallback={<DeliverySkeleton count={7} />}>
        <DeliveryContent />
      </Suspense>
    </>
  );
}

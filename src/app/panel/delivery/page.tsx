import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DeliveryInfo } from "@/shared/ui";
import { formatDeliveryDaysRange } from "@/shared/utils/calculateDelivery";
import { getDeliverySettings } from "@/lib/deliveryDb";
import { getDeliverySlots } from "@/lib/deliverySlotsDb";
import { getDeliveryBlackouts } from "@/lib/deliveryBlackoutsDb";
import { EmirateCard } from "@/pages_flow/panel/delivery/EmirateCard";
import { DeliverySkeleton } from "@/pages_flow/panel/delivery/DeliverySkeleton";
import { SlotsSection } from "@/pages_flow/panel/delivery/SlotsSection";
import { BlackoutsSection } from "@/pages_flow/panel/delivery/BlackoutsSection";

async function DeliveryContent() {
  const [settings, slots, blackouts] = await Promise.all([
    getDeliverySettings(),
    getDeliverySlots(),
    getDeliveryBlackouts(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="rounded-xl bg-sand/50 px-4 py-3">
          <DeliveryInfo label={formatDeliveryDaysRange(settings)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {settings.map((s) => (
            <EmirateCard key={s.id} setting={s} />
          ))}
        </div>
      </section>

      <SlotsSection slots={slots} />

      <BlackoutsSection blackouts={blackouts} slots={slots} />
    </div>
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

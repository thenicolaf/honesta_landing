import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DeliveryInfo } from "@/shared/ui";
import { formatDeliveryDaysRange } from "@/shared/utils/calculateDelivery";
import type { DeliverySetting } from "@/lib/deliveryDb";
import { EmirateCard } from "./EmirateCard";

interface Props {
  settings: DeliverySetting[];
}

export function DeliverySettingsPage({ settings }: Props) {
  return (
    <>
      <AdminPageHeader title="Delivery Settings" />

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

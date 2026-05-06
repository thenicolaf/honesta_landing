import { DollarSign, Gift, ShoppingCart, Clock, Hourglass } from "lucide-react";
import { formatDeliveryDays } from "@/shared/utils/calculateDelivery";
import type { DeliverySetting } from "@/lib/deliveryDb";

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-sand/60 p-2 text-earth/40 shrink-0 [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/40">
          {label}
        </p>
        <p className="font-body text-sm text-earth truncate">
          {value || <span className="text-earth/30 italic">Not set</span>}
        </p>
      </div>
    </div>
  );
}

interface EmirateViewProps {
  setting: DeliverySetting;
}

export function EmirateView({ setting }: EmirateViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <InfoField
        icon={<DollarSign />}
        label="Delivery Fee"
        value={`AED ${setting.delivery_fee}`}
      />
      <InfoField
        icon={<Gift />}
        label="Free From"
        value={
          setting.free_delivery_threshold != null
            ? `AED ${setting.free_delivery_threshold}`
            : null
        }
      />
      <InfoField
        icon={<ShoppingCart />}
        label="Minimum Order"
        value={
          setting.minimum_order != null
            ? `AED ${setting.minimum_order}`
            : null
        }
      />
      <InfoField
        icon={<Clock />}
        label="Delivery Time"
        value={formatDeliveryDays(setting.delivery_days)}
      />
      <InfoField
        icon={<Hourglass />}
        label="Cut-off Hour"
        value={`${String(setting.cutoff_hour).padStart(2, "0")}:00`}
      />
    </div>
  );
}

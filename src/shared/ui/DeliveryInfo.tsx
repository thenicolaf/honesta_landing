import { Truck } from "lucide-react";

interface DeliveryInfoProps {
  label: string;
}

export function DeliveryInfo({ label }: DeliveryInfoProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Truck className="w-3.5 h-3.5 text-earth/40" />
      <span className="font-body font-light text-earth/50 text-xs">
        {label}
      </span>
    </div>
  );
}

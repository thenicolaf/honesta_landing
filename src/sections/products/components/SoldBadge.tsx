import { Badge } from "@/shared/ui";

const MIN_SOLD_TO_SHOW = 50;

interface SoldBadgeProps {
  totalSold?: number;
  size?: "xs" | "sm";
}

export function SoldBadge({ totalSold, size = "xs" }: SoldBadgeProps) {
  if (!totalSold || totalSold < MIN_SOLD_TO_SHOW) return null;
  return (
    <Badge variant="counter" size={size} className="bg-earth! text-white-warm">
      {totalSold} SOLD
    </Badge>
  );
}

import { Badge } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import type { Product } from "../types";

const MARK_PRICE_COLOR: Record<string, string> = {
  best_seller: "text-red-700",
  new: "text-moss",
};

interface ProductPriceProps {
  price: number;
  promotion?: Product["promotion"];
  mark?: "standard" | "best_seller" | "new";
  className?: string;
}

export function ProductPrice({ price, promotion, mark, className }: ProductPriceProps) {
  if (!promotion) {
    const color = (mark && MARK_PRICE_COLOR[mark]) ?? "text-earth";
    return (
      <span className={`font-body font-semibold ${color} text-sm ${className ?? ""}`}>
        AED {price.toFixed(2)}
      </span>
    );
  }

  const discountLabel =
    promotion.discountType === "percentage"
      ? `-${promotion.discountValue}%`
      : `-${promotion.discountValue} AED`;

  return (
    <div className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span className="font-body font-bold text-orange text-sm">
          AED {promotion.discountedPrice.toFixed(2)}
        </span>
        <Badge variant="counter" size="pill">
          {discountLabel}
        </Badge>
      </div>
      <span className="font-body text-earth/40 text-xs line-through">
        AED {price.toFixed(2)}
      </span>
      {promotion.endsAt && (
        <span className="font-body text-2xs text-earth/40">
          Until {formatDateTime(promotion.endsAt)}
        </span>
      )}
    </div>
  );
}

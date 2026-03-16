import { Badge } from "@/shared/ui";
import type { Product } from "../types";

interface ProductPriceProps {
  price: number;
  promotion?: Product["promotion"];
  className?: string;
}

export function ProductPrice({ price, promotion, className }: ProductPriceProps) {
  if (!promotion) {
    return (
      <span className={`font-body font-semibold text-earth text-sm ${className ?? ""}`}>
        AED {price}
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
        AED {price}
      </span>
    </div>
  );
}

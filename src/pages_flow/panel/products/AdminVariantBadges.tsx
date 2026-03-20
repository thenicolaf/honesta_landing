import { Badge } from "@/shared/ui";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import type { Product } from "@/sections/products/types";

interface AdminVariantBadgesProps {
  variants: { id: string; weight_g: number; price: string }[];
  promotion?: Product["promotion"];
  size?: "xs" | "sm";
}

export function AdminVariantBadges({
  variants,
  promotion,
  size = "xs",
}: AdminVariantBadgesProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {variants
        .slice()
        .sort((a, b) => a.weight_g - b.weight_g)
        .map((v) => {
          const base = Number(v.price);
          const discounted = promotion
            ? calculateDiscountedPrice(
                base,
                promotion.discountType,
                promotion.discountValue,
              )
            : null;

          return (
            <Badge key={v.id} variant="warm" size={size}>
              <span className="text-earth/60">{v.weight_g}g</span>
              <span className="text-earth/25 mx-0.5">—</span>
              {discounted && discounted !== base ? (
                <>
                  <span className="line-through text-earth/30">AED {base}</span>{" "}
                  <span className="text-orange font-semibold">AED {discounted.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-earth font-semibold">AED {base}</span>
              )}
            </Badge>
          );
        })}
    </div>
  );
}

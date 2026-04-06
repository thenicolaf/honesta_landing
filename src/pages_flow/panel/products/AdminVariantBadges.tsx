import { Badge } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";
import type { Product } from "@/sections/products/types";

const MARK_PRICE_COLOR: Record<string, string> = {
  best_seller: "text-red-700",
  new: "text-moss",
};

interface AdminVariantBadgesProps {
  variants: { id: string; weight_g: number; price: string }[];
  promotion?: Product["promotion"];
  mark?: "standard" | "best_seller" | "new";
  size?: "xs" | "sm";
}

export function AdminVariantBadges({
  variants,
  promotion,
  mark,
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
                  <span className="line-through text-earth/30">AED {base.toFixed(2)}</span>{" "}
                  <span className="text-orange font-semibold">AED {discounted.toFixed(2)}</span>
                </>
              ) : (
                <span className={`${(mark && MARK_PRICE_COLOR[mark]) ?? "text-earth"} font-semibold`}>AED {base.toFixed(2)}</span>
              )}
            </Badge>
          );
        })}
      {promotion?.endsAt && (
        <span className="basis-full text-2xs text-earth/40 font-body">
          Until {formatDateTime(promotion.endsAt)}
        </span>
      )}
    </div>
  );
}

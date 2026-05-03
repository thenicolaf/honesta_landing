import { formatAed } from "@/shared/ui/Table";
import type { ManualOrderTotals } from "../totals";
import { ManualOrderSection } from "./ManualOrderSection";

interface OrderSummarySectionProps {
  totals: ManualOrderTotals;
  emirate: string;
}

export function OrderSummarySection({
  totals,
  emirate,
}: OrderSummarySectionProps) {
  const { subtotal, promotionDiscount, delivery, total } = totals;

  return (
    <ManualOrderSection title="Summary" className="gap-3">
      <div className="flex flex-col gap-1.5 font-body text-sm text-earth">
        <div className="flex justify-between">
          <span className="text-earth/60">Subtotal</span>
          <span>{formatAed(subtotal)}</span>
        </div>

        {promotionDiscount > 0 && (
          <div className="flex justify-between text-orange">
            <span>Promotion discount</span>
            <span>− {formatAed(promotionDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-earth/60">
            Delivery
            {delivery.isFreeDelivery && (
              <span className="ml-1 text-moss text-xs">(free)</span>
            )}
          </span>
          <span>{formatAed(delivery.fee)}</span>
        </div>

        {delivery.belowMinimum && delivery.minimumOrder != null && (
          <p className="text-2xs text-red-500">
            Minimum order for {emirate} is {formatAed(delivery.minimumOrder)}
          </p>
        )}

        <div className="border-t border-earth/10 mt-1 pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatAed(total)}</span>
        </div>
      </div>
    </ManualOrderSection>
  );
}

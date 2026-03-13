import { Button } from "@/shared/ui";
import { IconReceipt } from "@/shared/icons";

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <IconReceipt className="w-10 h-10 text-earth/15" />
      <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/35">
        No orders yet
      </p>
      <p className="font-body font-light text-sm text-earth/40 max-w-xs">
        Your completed orders will appear here once you make a purchase.
      </p>
      <Button href="/#products" variant="outline" size="sm" className="mt-2">
        Browse Products
      </Button>
    </div>
  );
}

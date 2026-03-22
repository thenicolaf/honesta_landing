import { EmptyState } from "@/shared/ui";
import { IconReceipt } from "@/shared/icons";

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<IconReceipt className="w-10 h-10 text-earth/15" />}
      label="No orders yet"
      description="Your completed orders will appear here once you make a purchase."
      action={{ label: "Browse Products", href: "/#products" }}
    />
  );
}

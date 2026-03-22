import { Badge } from "@/shared/ui";
import { OrderStatus } from "@/shared/types";

export function StatusBadge({ status }: { status: string }) {
  if (status === OrderStatus.PAID) {
    return (
      <Badge variant="natural" size="sm">
        Paid
      </Badge>
    );
  }
  if (status === OrderStatus.PENDING) {
    return (
      <Badge variant="warm" size="sm">
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="sm" className="text-red-500 border-red-200">
      {status === OrderStatus.CANCELLED ? "Cancelled" : "Failed"}
    </Badge>
  );
}

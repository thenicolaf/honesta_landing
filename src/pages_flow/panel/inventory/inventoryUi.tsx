import { Badge } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { InventoryStatus } from "@/lib/inventoryDb";

export const REASON_LABELS: Record<string, string> = {
  order_paid: "Order paid",
  restock: "Restock",
  correction: "Correction",
  damage: "Damage",
  manual_adjust: "Manual",
};

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  if (status === "out") {
    return (
      <Badge variant="warm" size="xs" className="whitespace-nowrap bg-red-500/10! text-red-600! border-red-200/60!">
        Out
      </Badge>
    );
  }
  if (status === "low") {
    return (
      <Badge variant="warm" size="xs" className="whitespace-nowrap bg-orange/15! text-orange! border-orange/30!">
        Low
      </Badge>
    );
  }
  return (
    <Badge variant="natural" size="xs" className="whitespace-nowrap">
      In stock
    </Badge>
  );
}

export function inventoryRowAccent(status: InventoryStatus) {
  if (status === "out") return "bg-red-500/5 border-red-200/60";
  if (status === "low") return "bg-orange/5 border-orange/30";
  return "bg-white-warm border-parchment";
}

export function stockTone(status: InventoryStatus) {
  if (status === "out") return "text-red-600";
  if (status === "low") return "text-orange";
  return "text-earth";
}

export function formatGrams(g: number): string {
  return `${g.toLocaleString("en-US")} g`;
}

export function formatAedPerHundred(value: number): string {
  return `AED ${value.toFixed(2)}`;
}

export function formatSignedDelta(deltaG: number): string {
  const sign = deltaG > 0 ? "+" : "";
  return `${sign}${deltaG.toLocaleString("en-US")} g`;
}

export function deltaTone(deltaG: number) {
  return cn(
    "text-sm font-semibold tabular-nums",
    deltaG < 0 ? "text-red-600" : "text-moss",
  );
}

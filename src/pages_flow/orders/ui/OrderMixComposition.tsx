"use client";

import {
  Badge,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import type { MixCompositionEntry } from "@/lib/orders";

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

interface OrderMixCompositionProps {
  items: MixCompositionEntry[] | null | undefined;
}

export function OrderMixComposition({ items }: OrderMixCompositionProps) {
  if (!items || items.length === 0) return null;

  const totalCells = items.reduce((sum, m) => sum + m.count, 0);

  return (
    <Collapsible className="mt-1">
      <CollapsibleTrigger
        onClick={stop}
        className="inline-flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors"
      >
        Composition · {totalCells} {totalCells === 1 ? "item" : "items"}
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-x-1.5 gap-y-1.5 mt-2 pr-2">
          {items.map((m, i) => (
            <div key={i} className="relative">
              <Badge variant="outline" size="xs">
                {m.name}
              </Badge>
              <Badge
                variant="counter"
                size="pill"
                className="absolute -top-1.5 -right-1.5"
              >
                {m.count}
              </Badge>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

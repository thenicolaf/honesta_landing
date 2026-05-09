"use client";

import Image from "next/image";
import {
  Badge,
  Collapsible,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { formatAed } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";

export interface MixCompositionItem {
  name: string;
  image_url?: string | null;
  count: number;
  weight_g: number;
  price: number;
}

interface MixCompositionListProps {
  items: MixCompositionItem[] | null | undefined;
  className?: string;
  /** Override the default `Composition · N items` label. */
  triggerLabel?: string;
  /** Show the `×N` badge on thumbnails. Default true. Set false when listing presets (each count is 1). */
  showCountBadge?: boolean;
  /**
   * Compact 2-col layout (image + stacked content) for narrow contexts like
   * the admin mix grid where the standard 3-col `[image | name | price]` row
   * starves the middle column. Combines weight + price into a single line
   * below the name.
   */
  compact?: boolean;
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

export function MixCompositionList({
  items,
  className,
  triggerLabel,
  showCountBadge = true,
  compact = false,
}: MixCompositionListProps) {
  if (!items || items.length === 0) return null;

  const totalCells = items.reduce((sum, m) => sum + m.count, 0);
  const label =
    triggerLabel ??
    `Composition · ${totalCells} ${totalCells === 1 ? "item" : "items"}`;

  return (
    <Collapsible className={cn("mt-1", className)}>
      <CollapsibleTrigger
        onClick={stop}
        className="inline-flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors"
      >
        {label}
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-2 mt-2 pb-2 pr-1">
          {items.map((m, i) => {
            const totalWeight = m.count * m.weight_g;
            const totalPrice = m.count * m.price;

            const thumbnail = (
              <div className="relative shrink-0 w-9 h-9">
                <div className="absolute inset-0 rounded-lg bg-sand overflow-hidden">
                  {m.image_url ? (
                    <Image
                      src={m.image_url}
                      alt={m.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-earth/30">
                      <IconLeaf className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {showCountBadge && (
                  <Badge
                    variant="counter"
                    size="pill"
                    className="absolute -bottom-1.5 -right-1.5 px-1.5! py-0.5! text-[0.55rem]! leading-none!"
                  >
                    ×{m.count}
                  </Badge>
                )}
              </div>
            );

            if (compact) {
              return (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] items-start gap-2.5 min-w-0"
                >
                  {thumbnail}
                  <div className="flex flex-col min-w-0">
                    <span className="font-body font-medium text-xs text-earth capitalize wrap-break-word">
                      {m.name}
                    </span>
                    <span className="font-body font-light text-2xs text-earth/55 tabular-nums wrap-break-word">
                      <span>{totalWeight}g</span>
                      <span className="text-earth/30"> · </span>
                      <span className="font-semibold text-earth">
                        {formatAed(totalPrice)}
                      </span>
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5"
              >
                {thumbnail}

                <div className="flex flex-col min-w-0">
                  <span className="font-body font-medium text-xs text-earth capitalize truncate">
                    {m.name}
                  </span>
                  <span className="font-body font-light text-2xs text-earth/55">
                    {totalWeight}g total
                  </span>
                </div>

                <span className="font-body font-semibold text-xs text-earth whitespace-nowrap">
                  {formatAed(totalPrice)}
                </span>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

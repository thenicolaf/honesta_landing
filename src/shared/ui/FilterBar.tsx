"use client";

import { cn } from "@/shared/utils/cn";
import { TagToolbar, TagToolbarItem } from "./TagToolbar";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterBarItem {
  value: string;
  label: string;
}

interface FilterBarProps {
  value: string;
  onValueChange: (value: string) => void;
  items: FilterBarItem[];
  allLabel?: string;
  label?: string;
  className?: string;
}

// ─── FilterBar ───────────────────────────────────────────────────────────────

export function FilterBar({
  value,
  onValueChange,
  items,
  allLabel = "All",
  label,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      {label && (
        <span className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/40 shrink-0">
          {label}
        </span>
      )}
      <TagToolbar value={value} onValueChange={onValueChange}>
        <TagToolbarItem value="">{allLabel}</TagToolbarItem>
        {items.map((item) => (
          <TagToolbarItem key={item.value} value={item.value}>
            {item.label}
          </TagToolbarItem>
        ))}
      </TagToolbar>
    </div>
  );
}

"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { useFilterBar } from "@/providers";
import {
  DEFAULT_PROFIT_RANGE,
  isValidRange,
  type ProfitRange,
} from "./profitTypes";

const RANGE_ITEMS: { value: ProfitRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

export function useProfitRange(): ProfitRange {
  const { value } = useFilterBar("range");
  return isValidRange(value) ? value : DEFAULT_PROFIT_RANGE;
}

export function DateRangeSelector() {
  const range = useFilterBar("range");
  const current = isValidRange(range.value) ? range.value : DEFAULT_PROFIT_RANGE;

  return (
    <Select
      value={current}
      onValueChange={(next) =>
        range.onValueChange(next === DEFAULT_PROFIT_RANGE ? "" : next)
      }
      options={RANGE_ITEMS}
    >
      <SelectTrigger className="w-full sm:w-48 h-9 bg-white-warm! border-earth/15! hover:border-earth/35!">
        <SelectValue placeholder="Last 30 days" />
      </SelectTrigger>
      <SelectContent>
        {(opts) =>
          opts.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}

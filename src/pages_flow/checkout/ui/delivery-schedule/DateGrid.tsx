"use client";

import { FormTileRadio, FormTileRadioItem } from "@/shared/ui";
import { formatLongDate } from "@/shared/utils/zonedTime";
import type { DayCell } from "./buildDayCells";

interface DateGridProps {
  cells: DayCell[];
  weekdayLabels: string[];
  selectedDateIso: string;
  onPick: (iso: string) => void;
}

export function DateGrid({
  cells,
  weekdayLabels,
  selectedDateIso,
  onPick,
}: DateGridProps) {
  return (
    <div className="max-w-md">
      <div aria-hidden="true" className="grid grid-cols-7 gap-1.5 mb-1">
        {weekdayLabels.map((label, i) => (
          <div
            key={i}
            className="text-center font-body font-semibold uppercase tracking-widest text-2xs text-earth/45"
          >
            {label}
          </div>
        ))}
      </div>

      <FormTileRadio
        name="delivery_date_tile"
        value={selectedDateIso}
        onValueChange={onPick}
        className="grid grid-cols-7 gap-1.5"
      >
        {cells.map((cell) => (
          <FormTileRadioItem
            key={cell.iso}
            value={cell.iso}
            disabled={!cell.available}
            className="aspect-square p-0! flex items-center justify-center text-sm tabular-nums normal-case tracking-normal"
          >
            <span aria-label={formatLongDate(cell.date)}>
              {cell.dayOfMonth}
            </span>
          </FormTileRadioItem>
        ))}
      </FormTileRadio>
    </div>
  );
}

"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { WEEKDAYS_ISO, weekdayShortLabel } from "@/shared/consts/delivery";
import { useSlotActions } from "./SlotActionsProvider";

function formatRange(slot: DeliverySlot): string {
  return `${slot.start_time.slice(0, 5)} – ${slot.end_time.slice(0, 5)}`;
}

export function SlotCard({ slot }: { slot: DeliverySlot }) {
  const { openEdit, openDelete } = useSlotActions();
  const activeWeekdays = new Set(slot.available_weekdays);

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 p-3.5 hover:shadow-lg hover:border-transparent transition-colors duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-body font-semibold tabular-nums text-earth text-base leading-tight">
            {formatRange(slot)}
          </p>
          <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 truncate">
            {slot.label}
          </p>
        </div>
        <Badge
          variant={slot.is_active ? "natural" : "outline"}
          size="xs"
          className={!slot.is_active ? "text-earth/55" : undefined}
        >
          {slot.is_active ? "Active" : "Disabled"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1 mt-2.5">
        {WEEKDAYS_ISO.map((d) => {
          const isOn = activeWeekdays.has(d);
          return (
            <span
              key={d}
              className={
                isOn
                  ? "px-2 py-0.5 rounded-full text-2xs font-body font-semibold tracking-[0.06em] bg-moss/12 text-moss border border-moss/30"
                  : "px-2 py-0.5 rounded-full text-2xs font-body tracking-[0.06em] text-earth/40 border border-earth/15"
              }
            >
              {weekdayShortLabel(d)}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          startIcon={<Pencil size={13} />}
          onClick={() => openEdit(slot)}
        >
          Edit
        </Button>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          className="text-earth/40 hover:text-red-500"
          onClick={() => openDelete(slot)}
          aria-label="Delete"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}

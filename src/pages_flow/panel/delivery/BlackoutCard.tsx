"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { formatLongDate, fromDateOnlyString } from "@/shared/utils/zonedTime";
import { useBlackoutActions } from "./BlackoutActionsProvider";

interface BlackoutCardProps {
  blackout: DeliveryBlackout;
  slots: DeliverySlot[];
}

export function BlackoutCard({ blackout, slots }: BlackoutCardProps) {
  const { openEdit, openDelete } = useBlackoutActions();
  const date = fromDateOnlyString(blackout.blackout_date);
  const slot = blackout.slot_id
    ? slots.find((s) => s.id === blackout.slot_id) ?? null
    : null;

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-earth/8 p-4 hover:shadow-lg hover:border-transparent transition-colors duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="font-body font-semibold tabular-nums text-earth text-base leading-tight">
            {formatLongDate(date)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {slot ? (
              <Badge variant="warm" size="xs">
                {slot.label} · {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
              </Badge>
            ) : (
              <Badge variant="warm" size="xs">
                All day
              </Badge>
            )}
          </div>
        </div>
      </div>

      {blackout.reason && (
        <p className="font-body text-sm text-earth/75 mt-3 leading-snug">
          {blackout.reason}
        </p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-3">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          startIcon={<Pencil size={13} />}
          onClick={() => openEdit(blackout)}
        >
          Edit
        </Button>
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          className="text-earth/40 hover:text-red-500"
          onClick={() => openDelete(blackout)}
          aria-label="Remove blackout"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}

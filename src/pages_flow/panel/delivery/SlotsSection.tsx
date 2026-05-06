"use client";

import { Plus } from "lucide-react";
import { Button, EmptyState } from "@/shared/ui";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { SlotActionsProvider, useSlotActions } from "./SlotActionsProvider";
import { SlotCard } from "./SlotCard";
import { ADMIN_SLOT_GRID_CLASS } from "./SlotsSkeleton";

function CreateSlotButton() {
  const { openCreate } = useSlotActions();
  return (
    <Button
      as="button"
      type="button"
      variant="primary"
      size="sm"
      startIcon={<Plus size={14} aria-hidden="true" />}
      onClick={openCreate}
    >
      Add slot
    </Button>
  );
}

export function SlotsSection({ slots }: { slots: DeliverySlot[] }) {
  const sorted = [...slots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  return (
    <SlotActionsProvider slots={sorted}>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-heading text-xl sm:text-2xl">
            Delivery slots
          </h2>
          <CreateSlotButton />
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            label="No slots yet"
            description="Create the first time slot so customers can pick a delivery window."
          />
        ) : (
          <div className={ADMIN_SLOT_GRID_CLASS}>
            {sorted.map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </section>
    </SlotActionsProvider>
  );
}

"use client";

import { Plus } from "lucide-react";
import { Button, EmptyState } from "@/shared/ui";
import type { DeliveryBlackout } from "@/lib/deliveryBlackoutsDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import { ADMIN_SLOT_GRID_CLASS } from "./SlotsSkeleton";
import { BlackoutCard } from "./BlackoutCard";
import {
  BlackoutActionsProvider,
  useBlackoutActions,
} from "./BlackoutActionsProvider";

function CreateBlackoutButton() {
  const { openCreate } = useBlackoutActions();
  return (
    <Button
      as="button"
      type="button"
      variant="primary"
      size="sm"
      startIcon={<Plus size={14} aria-hidden="true" />}
      onClick={openCreate}
    >
      Block date
    </Button>
  );
}

interface BlackoutsSectionProps {
  blackouts: DeliveryBlackout[];
  slots: DeliverySlot[];
}

export function BlackoutsSection({ blackouts, slots }: BlackoutsSectionProps) {
  return (
    <BlackoutActionsProvider slots={slots}>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-heading text-xl sm:text-2xl">
            Blocked dates
          </h2>
          <CreateBlackoutButton />
        </div>

        {blackouts.length === 0 ? (
          <EmptyState
            label="No blackouts"
            description="Add a blackout when delivery needs to be disabled for a specific day."
          />
        ) : (
          <div className={ADMIN_SLOT_GRID_CLASS}>
            {blackouts.map((b) => (
              <BlackoutCard key={b.id} blackout={b} slots={slots} />
            ))}
          </div>
        )}
      </section>
    </BlackoutActionsProvider>
  );
}

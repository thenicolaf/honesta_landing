"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, EmptyState } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { DeliverySetting } from "@/lib/deliveryDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import {
  resolveEmirateSchedule,
  summarizeEmirateSchedules,
  type EmirateScheduleSummary,
} from "@/shared/utils/deliverySlots";
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

function pluralSlots(n: number): string {
  return `${n} slot${n === 1 ? "" : "s"}`;
}

type TileTone = "own" | "default" | "off" | "disabled" | "neutral";

const DOT_CLASS: Record<TileTone, string> = {
  own: "bg-orange",
  default: "bg-moss",
  off: "bg-red-500",
  disabled: "bg-earth/25",
  neutral: "bg-earth/40",
};

const STATUS_TEXT_CLASS: Record<TileTone, string> = {
  own: "text-orange",
  default: "text-moss",
  off: "text-red-600",
  disabled: "text-earth/45",
  neutral: "text-earth/55",
};

function describeEmirate(
  summary: EmirateScheduleSummary,
  isEmirateActive: boolean,
): { tone: TileTone; status: string } {
  if (!isEmirateActive) return { tone: "disabled", status: "Delivery off" };
  if (summary.mode === "own")
    return { tone: "own", status: `Own · ${pluralSlots(summary.activeCount)}` };
  if (summary.status === "active")
    return {
      tone: "default",
      status: `All emirates · ${pluralSlots(summary.activeCount)}`,
    };
  return { tone: "off", status: "No slots" };
}

/**
 * Clickable status tile — doubles as the emirate filter for the slot grid,
 * so the overview and the filter aren't two separate rows of emirate names.
 */
function EmirateTile({
  name,
  status,
  tone,
  selected,
  muted,
  onSelect,
}: {
  name: string;
  status: string;
  tone: TileTone;
  selected: boolean;
  muted?: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      as="button"
      type="button"
      variant="text"
      size="inline"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "h-full w-full flex-col items-start justify-start gap-1 rounded-xl border px-3 py-2.5 text-left",
        "transition-colors duration-200",
        selected
          ? "border-earth bg-sand/70"
          : "border-earth/10 bg-white-warm hover:border-earth/30",
      )}
    >
      <span
        className={cn(
          "font-body font-semibold text-sm leading-tight",
          muted ? "text-earth/45" : "text-earth",
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-body text-2xs",
          STATUS_TEXT_CLASS[tone],
        )}
      >
        <span
          aria-hidden="true"
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_CLASS[tone])}
        />
        {status}
      </span>
    </Button>
  );
}

function EmirateScheduleOverview({
  settings,
  slots,
  selected,
  onSelect,
}: {
  settings: DeliverySetting[];
  slots: DeliverySlot[];
  selected: string;
  onSelect: (emirate: string) => void;
}) {
  const summaries = summarizeEmirateSchedules(
    settings.map((s) => s.emirate),
    slots,
  );
  const activeSlotCount = slots.filter((s) => s.is_active).length;
  const schedulingEnabled = summaries.some((s) => s.status === "active");
  const uncovered = summaries
    .filter((s, i) => settings[i].is_active && s.status === "off")
    .map((s) => s.emirate);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55">
          Schedule by emirate
        </p>
        <p className="font-body text-2xs text-earth/55">
          Slots without emirates (<span className="text-moss">All emirates</span>)
          apply wherever an emirate has no{" "}
          <span className="text-orange">own</span> active slots. Pick an
          emirate to see what its customers can choose at checkout.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-4 min-[1500px]:grid-cols-8">
        <EmirateTile
          name="All slots"
          status={`${activeSlotCount} active of ${slots.length}`}
          tone="neutral"
          selected={selected === ""}
          onSelect={() => onSelect("")}
        />
        {summaries.map((summary, i) => {
          const isEmirateActive = settings[i].is_active;
          const { tone, status } = describeEmirate(summary, isEmirateActive);
          return (
            <EmirateTile
              key={summary.emirate}
              name={summary.emirate}
              status={status}
              tone={tone}
              muted={!isEmirateActive}
              selected={selected === summary.emirate}
              onSelect={() => onSelect(summary.emirate)}
            />
          );
        })}
      </div>

      {schedulingEnabled && uncovered.length > 0 && (
        <Alert
          variant="warning"
          title={`No delivery slots for ${uncovered.join(", ")}`}
        >
          Customers there check out without picking a delivery date. Add a
          slot for {uncovered.length === 1 ? "this emirate" : "these emirates"},
          a slot for all emirates, or deactivate{" "}
          {uncovered.length === 1 ? "it" : "them"} in the section above.
        </Alert>
      )}
    </div>
  );
}

interface SlotsSectionProps {
  slots: DeliverySlot[];
  settings: DeliverySetting[];
}

export function SlotsSection({ slots, settings }: SlotsSectionProps) {
  const [emirateFilter, setEmirateFilter] = useState("");

  const sorted = [...slots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  // Filtered view = exactly what customers of that emirate see at checkout.
  const visible = emirateFilter
    ? resolveEmirateSchedule(sorted, emirateFilter).slots
    : sorted;

  const emirateOptions = settings.map((s) => ({
    emirate: s.emirate,
    is_active: s.is_active,
  }));

  return (
    <SlotActionsProvider slots={sorted} emirateOptions={emirateOptions}>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-heading text-xl sm:text-2xl">
            Delivery slots
          </h2>
          <CreateSlotButton />
        </div>

        {sorted.length > 0 && settings.length > 0 && (
          <EmirateScheduleOverview
            settings={settings}
            slots={sorted}
            selected={emirateFilter}
            onSelect={setEmirateFilter}
          />
        )}

        {sorted.length === 0 ? (
          <EmptyState
            label="No slots yet"
            description="Create the first time slot so customers can pick a delivery window."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            label={`No active slots for ${emirateFilter}`}
            description="Customers from this emirate place orders without picking a delivery date."
          />
        ) : (
          <>
            {emirateFilter && (
              <p className="font-body text-2xs text-earth/55 -mt-1">
                Active slots customers in {emirateFilter} can pick at checkout.
              </p>
            )}
            <div className={ADMIN_SLOT_GRID_CLASS}>
              {visible.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </>
        )}
      </section>
    </SlotActionsProvider>
  );
}

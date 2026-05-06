"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toastError } from "@/shared/ui";
import type { Product } from "@/sections/products/types/types";
import type { DeliverySetting } from "@/lib/deliveryDb";
import type { DeliverySlot } from "@/lib/deliverySlotsDb";
import type { MixBox } from "@/lib/mixBoxesDb";
import { emptyRow, type ItemRow } from "./OrderItemsPicker";
import type { PendingMix } from "./AdminMixBuilder";
import {
  createManualOrderAction,
  type ManualOrderState,
} from "./actions";
import { useDeliverySchedule } from "./useDeliverySchedule";
import { buildManualOrderTotals } from "./totals";
import { CustomerInfoSection } from "./sections/CustomerInfoSection";
import { DeliveryAddressSection } from "./sections/DeliveryAddressSection";
import { DeliveryScheduleSection } from "./sections/DeliveryScheduleSection";
import { ProductsSection } from "./sections/ProductsSection";
import { MixesSection } from "./sections/MixesSection";
import { NotesSection } from "./sections/NotesSection";
import { OrderSummarySection } from "./sections/OrderSummarySection";
import { ManualOrderFooter } from "./sections/ManualOrderFooter";

interface Props {
  products: Product[];
  deliverySettings: DeliverySetting[];
  slots: DeliverySlot[];
  boxes: MixBox[];
}

function useToastOnStateChange(state: ManualOrderState | null) {
  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);
}

export function ManualOrderForm({
  products,
  deliverySettings,
  slots,
  boxes,
}: Props) {
  const [state, dispatch, isPending] = useActionState<
    ManualOrderState | null,
    FormData
  >(createManualOrderAction, null);

  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [mixes, setMixes] = useState<PendingMix[]>([]);
  const [emirate, setEmirate] = useState<string>("Dubai");
  const schedule = useDeliverySchedule(slots);

  useToastOnStateChange(state);

  const totals = buildManualOrderTotals({
    rows,
    mixes,
    products,
    boxes,
    deliverySettings,
    emirate,
  });

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <CustomerInfoSection
        values={state?.values}
        fieldErrors={state?.fieldErrors}
      />

      <DeliveryAddressSection
        values={state?.values}
        fieldErrors={state?.fieldErrors}
        onEmirateChange={setEmirate}
      />

      {slots.length > 0 && (
        <DeliveryScheduleSection
          date={schedule.date}
          slotId={schedule.slotId}
          filteredSlots={schedule.filteredSlots}
          scheduleText={schedule.scheduleText}
          fieldErrors={state?.fieldErrors}
          onDateChange={schedule.setDate}
          onSlotChange={schedule.setSlotId}
        />
      )}

      <ProductsSection
        products={products}
        rows={rows}
        onChange={setRows}
        error={state?.fieldErrors?.items}
      />

      <MixesSection boxes={boxes} mixes={mixes} onChange={setMixes} />

      <NotesSection defaultValue={state?.values?.notes} />

      <OrderSummarySection totals={totals} emirate={emirate} />

      <ManualOrderFooter isPending={isPending} />
    </form>
  );
}

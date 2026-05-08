"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Info } from "lucide-react";
import {
  Button,
  FormError,
  FormLabel,
  FormNumberInput,
  FormRichTextarea,
  FormSelect,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import type { InventoryRow } from "@/lib/inventoryDb";
import {
  adjustStockAction,
  type AdjustStockState,
} from "./actions";
import { invalidateMovementsCache } from "./MovementsHistory";

const REASON_OPTIONS = [
  { value: "restock", label: "Restock" },
  { value: "correction", label: "Correction" },
  { value: "damage", label: "Damage" },
  { value: "manual_adjust", label: "Manual" },
];

interface AdjustStockFormProps {
  row: InventoryRow;
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button as="button" type="submit" variant="primary" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Apply"}
    </Button>
  );
}

export function AdjustStockForm({ row, onClose }: AdjustStockFormProps) {
  const action = adjustStockAction.bind(null, row.product_id);
  const [state, dispatch] = useActionState<AdjustStockState | null, FormData>(
    action,
    null,
  );

  const [delta, setDelta] = useState<number>(
    Number(state?.values?.delta_g ?? 0),
  );
  const [reason, setReason] = useState<string>(
    state?.values?.reason ?? "restock",
  );

  const prev = useRef(state);
  useEffect(() => {
    if (state === prev.current) return;
    prev.current = state;
    if (state?.success) {
      invalidateMovementsCache(row.product_id);
      toastSuccess("Stock updated");
      onClose();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) {
      const first = Object.values(state.fieldErrors)[0];
      if (first) toastError(first);
    }
  }, [state, onClose, row.product_id]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-1 mb-2">
          <FormLabel htmlFor="adjust-delta" required className="mb-0!">
            Change (grams)
          </FormLabel>
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <Button
                as="button"
                type="button"
                variant="text"
                size="icon"
                aria-label="Change info"
                className="text-earth/40 hover:text-earth/70"
              >
                <Info size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-56 whitespace-normal text-left leading-snug">
              Positive number to restock, negative to write off.
            </TooltipContent>
          </Tooltip>
        </div>
        <FormNumberInput
          id="adjust-delta"
          name="delta_g"
          value={delta}
          onValueChange={setDelta}
          step={50}
          state={state?.fieldErrors?.delta_g ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.delta_g} />
      </div>

      <div>
        <FormLabel htmlFor="adjust-reason" required>
          Reason
        </FormLabel>
        <FormSelect
          id="adjust-reason"
          name="reason"
          value={reason}
          onValueChange={setReason}
          options={REASON_OPTIONS}
          state={state?.fieldErrors?.reason ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.reason} />
      </div>

      <div>
        <FormLabel htmlFor="adjust-note">Note (optional)</FormLabel>
        <FormRichTextarea
          id="adjust-note"
          name="note"
          placeholder="Batch from supplier X / spoilage / …"
          defaultValue={state?.values?.note ?? ""}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button as="button" type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

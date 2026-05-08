"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Info } from "lucide-react";
import {
  Button,
  FormError,
  FormLabel,
  FormNumberInput,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import type { InventoryRow } from "@/lib/inventoryDb";
import {
  updateInventorySettingsAction,
  type UpdateInventorySettingsState,
} from "./actions";

interface EditInventoryFormProps {
  row: InventoryRow;
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
    >
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

export function EditInventoryForm({ row, onClose }: EditInventoryFormProps) {
  const action = updateInventorySettingsAction.bind(null, row.product_id);
  const [state, dispatch] = useActionState<
    UpdateInventorySettingsState | null,
    FormData
  >(action, null);

  const [cost, setCost] = useState<number>(
    Number(state?.values?.cost_per_100g ?? row.cost_per_100g),
  );
  const [threshold, setThreshold] = useState<number>(
    Number(state?.values?.low_stock_threshold_g ?? row.low_stock_threshold_g),
  );

  const prev = useRef(state);
  useEffect(() => {
    if (state === prev.current) return;
    prev.current = state;
    if (state?.success) {
      toastSuccess("Settings updated");
      onClose();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) {
      const first = Object.values(state.fieldErrors)[0];
      if (first) toastError(first);
    }
  }, [state, onClose]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="cost-per-100g" required>
          Cost per 100 g (AED)
        </FormLabel>
        <FormNumberInput
          id="cost-per-100g"
          name="cost_per_100g"
          value={cost}
          onValueChange={setCost}
          min={0}
          step={5}
          state={state?.fieldErrors?.cost_per_100g ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.cost_per_100g} />
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <FormLabel htmlFor="low-stock-threshold" required className="mb-0!">
            Low-stock threshold (g)
          </FormLabel>
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <Button
                as="button"
                type="button"
                variant="text"
                size="icon"
                aria-label="Threshold info"
                className="text-earth/40 hover:text-earth/70"
              >
                <Info size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-56 whitespace-normal text-left leading-snug">
              When stock falls below this, the row is highlighted. Notifications
              are not sent yet.
            </TooltipContent>
          </Tooltip>
        </div>
        <FormNumberInput
          id="low-stock-threshold"
          name="low_stock_threshold_g"
          value={threshold}
          onValueChange={setThreshold}
          min={0}
          step={50}
          state={
            state?.fieldErrors?.low_stock_threshold_g ? "error" : "default"
          }
        />
        <FormError message={state?.fieldErrors?.low_stock_threshold_g} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          as="button"
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

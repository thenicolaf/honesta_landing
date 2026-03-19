"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  FormLabel,
  FormNumberInput,
  FormCheckbox,
  FormError,
  Button,
  toastSuccess,
  toastError,
} from "@/shared/ui";
import type { DeliverySetting } from "@/lib/deliveryDb";
import { saveEmirateSetting, type EmirateSettingState } from "./actions";

interface EmirateFormProps {
  setting: DeliverySetting;
  onDone?: () => void;
  onCancel?: () => void;
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

export function EmirateForm({ setting, onDone, onCancel }: EmirateFormProps) {
  const [state, dispatch] = useActionState<EmirateSettingState | null, FormData>(
    saveEmirateSetting.bind(null, setting.id),
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess(`${setting.emirate} settings saved`);
      onDone?.();
    }
    if (state?.error) toastError(state.error);
  }, [state, setting.emirate, onDone]);

  return (
    <form key={state?.attempt ?? 0} action={dispatch}>
      <div className="flex flex-col gap-3">
        <div>
          <FormLabel htmlFor={`fee_${setting.id}`}>
            Delivery Fee (AED)
          </FormLabel>
          <FormNumberInput
            id={`fee_${setting.id}`}
            name="fee"
            step={1}
            min={0}
            defaultValue={state?.values?.fee ?? setting.delivery_fee}
            state={state?.fieldErrors?.fee ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.fee} />
        </div>

        <div>
          <FormLabel htmlFor={`threshold_${setting.id}`}>
            Free Delivery From (AED)
          </FormLabel>
          <FormNumberInput
            id={`threshold_${setting.id}`}
            name="threshold"
            step={1}
            min={0}
            placeholder="No free delivery"
            defaultValue={state?.values?.threshold ?? setting.free_delivery_threshold ?? ""}
            state={state?.fieldErrors?.threshold ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.threshold} />
        </div>

        <div>
          <FormLabel htmlFor={`minimum_${setting.id}`}>
            Minimum Order (AED)
          </FormLabel>
          <FormNumberInput
            id={`minimum_${setting.id}`}
            name="minimum"
            step={1}
            min={0}
            placeholder="No minimum"
            defaultValue={state?.values?.minimum ?? setting.minimum_order ?? ""}
            state={state?.fieldErrors?.minimum ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.minimum} />
        </div>

        <div>
          <FormLabel htmlFor={`days_${setting.id}`}>Delivery Days</FormLabel>
          <FormNumberInput
            id={`days_${setting.id}`}
            name="days"
            step={1}
            min={0}
            defaultValue={state?.values?.days ?? setting.delivery_days}
            state={state?.fieldErrors?.days ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.days} />
        </div>

        <div className="pt-1">
          <FormCheckbox
            id={`active_${setting.id}`}
            name="is_active"
            defaultChecked={state?.values?.is_active ?? setting.is_active}
            label="Active"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <SubmitButton />
          {onCancel && (
            <Button
              as="button"
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

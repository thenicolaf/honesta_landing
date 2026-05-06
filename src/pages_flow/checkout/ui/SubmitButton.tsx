"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui";

interface SubmitButtonProps {
  totalWithDelivery: number;
  belowMinimum?: boolean;
  minimumOrder?: number | null;
  agreedToTerms?: boolean;
  scheduleRequired?: boolean;
  scheduleSelected?: boolean;
}

interface SubmitState {
  pending: boolean;
  belowMinimum: boolean;
  minimumOrder: number | null | undefined;
  scheduleMissing: boolean;
  totalWithDelivery: number;
}

function getButtonLabel(state: SubmitState): string {
  if (state.pending) return "Processing...";
  if (state.belowMinimum) return `Minimum order AED ${state.minimumOrder}`;
  return `Pay AED ${state.totalWithDelivery.toFixed(2)}`;
}

function getErrorText(state: SubmitState): string | null {
  if (state.belowMinimum)
    return `Minimum order of AED ${state.minimumOrder} is required for your selected emirate`;
  if (state.scheduleMissing)
    return "Pick a delivery date and slot to continue";
  return null;
}

export function SubmitButton({
  totalWithDelivery,
  belowMinimum,
  minimumOrder,
  agreedToTerms,
  scheduleRequired,
  scheduleSelected,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const scheduleMissing = !!scheduleRequired && !scheduleSelected;
  const disabled =
    pending || !!belowMinimum || !agreedToTerms || scheduleMissing;

  const state: SubmitState = {
    pending,
    belowMinimum: !!belowMinimum,
    minimumOrder,
    scheduleMissing,
    totalWithDelivery,
  };
  const errorText = getErrorText(state);

  return (
    <div className="flex flex-col gap-1.5">
      <Button as="button" type="submit" disabled={disabled} className="w-full">
        {getButtonLabel(state)}
      </Button>
      {errorText && (
        <p className="font-body font-light text-red-500 text-xs text-center">
          {errorText}
        </p>
      )}
    </div>
  );
}

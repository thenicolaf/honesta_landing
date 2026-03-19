"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui";

interface SubmitButtonProps {
  totalWithDelivery: number;
  belowMinimum?: boolean;
  minimumOrder?: number | null;
}

export function SubmitButton({
  totalWithDelivery,
  belowMinimum,
  minimumOrder,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const disabled = pending || !!belowMinimum;

  return (
    <div className="flex flex-col gap-1.5">
      <Button as="button" type="submit" disabled={disabled} className="w-full">
        {pending
          ? "Processing..."
          : belowMinimum
            ? `Minimum order AED ${minimumOrder}`
            : `Pay AED ${totalWithDelivery.toFixed(2)}`}
      </Button>
      {belowMinimum && (
        <p className="font-body font-light text-red-500 text-xs text-center">
          Minimum order of AED {minimumOrder} is required for your selected
          emirate
        </p>
      )}
    </div>
  );
}

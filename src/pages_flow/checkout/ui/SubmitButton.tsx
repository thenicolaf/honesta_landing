"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui";

interface SubmitButtonProps {
  totalWithDelivery: number;
}

export function SubmitButton({ totalWithDelivery }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button as="button" type="submit" disabled={pending} className="w-full">
      {pending ? "Processing..." : `Pay AED ${totalWithDelivery.toFixed(2)}`}
    </Button>
  );
}

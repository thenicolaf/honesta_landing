"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/shared/ui";
import { toggleFulfilled } from "./actions";

interface FulfilledToggleProps {
  orderId: string;
  defaultChecked: boolean;
}

export function FulfilledToggle({
  orderId,
  defaultChecked,
}: FulfilledToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={checked}
      disabled={isPending}
      label={checked ? "Fulfilled" : "Unfulfilled"}
      onChange={(e) => {
        const next = e.target.checked;
        setChecked(next);
        startTransition(() => {
          toggleFulfilled(orderId, next);
        });
      }}
      aria-label="Mark as fulfilled"
    />
  );
}

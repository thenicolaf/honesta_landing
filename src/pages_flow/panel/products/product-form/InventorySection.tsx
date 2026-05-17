"use client";

import { useState } from "react";
import { Boxes, Info } from "lucide-react";
import {
  Button,
  FormError,
  FormLabel,
  FormNumberInput,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { pickAdminInventory } from "./inventory";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

export function InventorySection({ product, state }: SectionProps) {
  const inv = pickAdminInventory(product);

  const initialCost =
    state?.values?.cost_per_100g !== undefined
      ? Number(state.values.cost_per_100g)
      : inv.cost_per_100g;
  const initialThreshold =
    state?.values?.low_stock_threshold_g !== undefined
      ? Number(state.values.low_stock_threshold_g)
      : inv.low_stock_threshold_g;

  const [cost, setCost] = useState<number>(initialCost);
  const [threshold, setThreshold] = useState<number>(initialThreshold);

  return (
    <SectionCard>
      <div className="flex items-center gap-1">
        <SectionLabel>Inventory</SectionLabel>
        <Tooltip side="top">
          <TooltipTrigger asChild>
            <Button
              as="button"
              type="button"
              variant="text"
              size="icon"
              aria-label="Inventory info"
              className="text-earth/40 hover:text-earth/70"
            >
              <Info size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="w-64 whitespace-normal text-left leading-snug">
            Stock changes are recorded as movements in /panel/inventory — never edited directly here.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="cost_per_100g" required>
            Cost per 100 g (AED)
          </FormLabel>
          <FormNumberInput
            id="cost_per_100g"
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
          <FormLabel htmlFor="low_stock_threshold_g" required>
            Low-stock threshold (g)
          </FormLabel>
          <FormNumberInput
            id="low_stock_threshold_g"
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
      </div>

      {product && (
        <div className="flex items-center justify-between rounded-xl border border-parchment bg-cream/60 px-3 py-1.5">
          <div className="flex items-center gap-2 font-body text-2xs uppercase tracking-[0.12em] text-earth/55">
            <Boxes size={12} aria-hidden="true" />
            Current stock
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-2xs text-earth tabular-nums">
              {inv.stock_g.toLocaleString("en-US")} g
            </span>
            <Button
              href={`/panel/inventory?${new URLSearchParams({ search: product.title }).toString()}`}
              variant="text"
              size="sm"
            >
              Manage
            </Button>
          </div>
        </div>
      )}

    </SectionCard>
  );
}

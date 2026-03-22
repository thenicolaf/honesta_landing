"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
} from "@/shared/ui";
import { calculateDiscountedPrice } from "@/shared/utils/calculateDiscount";

export interface ProductOption {
  value: string;
  label: string;
  price: number;
}

interface ProductPickerProps {
  name: string;
  options: ProductOption[];
  defaultValue?: string[];
  placeholder?: string;
  discountType: string;
  discountValue: number;
  state?: "default" | "error";
}

export function ProductPicker({
  name,
  options,
  defaultValue = [],
  placeholder = "Select products…",
  discountType,
  discountValue,
  state,
}: ProductPickerProps) {
  const [values, setValues] = useState<string[]>(defaultValue);

  const dv = discountValue || 0;
  const dt = discountType as "percentage" | "fixed";

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(values)} />
      <MultiSelect
        value={values}
        onValueChange={setValues}
        options={options}
        clearable
      >
        <MultiSelectTrigger
          placeholder={placeholder}
          className={cn(
            "rounded-xl px-4 min-h-10 py-2 text-sm bg-cream",
            state === "error"
              ? "border-red-400 focus-visible:ring-red-300/40"
              : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
          )}
        />
        <MultiSelectContent searchPlaceholder="Search products…">
          {(opts) => (
            <>
              {opts.map((o) => {
                const product = options.find((p) => p.value === o.value);
                const price = product?.price ?? 0;
                const discounted =
                  dv > 0 ? calculateDiscountedPrice(price, dt, dv) : null;

                return (
                  <MultiSelectItem
                    key={o.value}
                    value={o.value}
                    searchValue={o.label}
                  >
                    <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                      <span className="truncate">{o.label}</span>
                      <span className="shrink-0 flex items-center gap-1.5 font-body text-xs">
                        {discounted !== null && discounted !== price ? (
                          <>
                            <span className="font-semibold text-orange">
                              AED {discounted.toFixed(2)}
                            </span>
                            <span className="text-earth/30 line-through">
                              {price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-earth/50">
                            AED {price.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                  </MultiSelectItem>
                );
              })}
              <MultiSelectEmpty />
            </>
          )}
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}

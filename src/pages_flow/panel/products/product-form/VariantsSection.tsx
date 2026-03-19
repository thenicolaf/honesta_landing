"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, FormLabel, FormNumberInput, FormError } from "@/shared/ui";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";
import { emptyRow, initRows, type VariantRow } from "./variants";

export function VariantsSection({ product, state }: SectionProps) {
  const [rows, setRows] = useState<VariantRow[]>(() =>
    initRows(product, state),
  );

  const update = (index: number, field: keyof VariantRow, value: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SectionCard>
      <SectionLabel>Variants</SectionLabel>

      <input type="hidden" name="variants" value={JSON.stringify(rows)} />

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
          >
            <div>
              {i === 0 && (
                <FormLabel htmlFor={`v-weight-${i}`}>Weight (g) *</FormLabel>
              )}
              <FormNumberInput
                id={`v-weight-${i}`}
                name={`variant_weight_${i}`}
                min={0}
                step={1}
                placeholder="e.g. 250"
                value={row.weight_g}
                onValueChange={(v) => update(i, "weight_g", v)}
                state={state?.fieldErrors?.variants ? "error" : "default"}
              />
            </div>
            <div>
              {i === 0 && (
                <FormLabel htmlFor={`v-price-${i}`}>Price (AED) *</FormLabel>
              )}
              <FormNumberInput
                id={`v-price-${i}`}
                name={`variant_price_${i}`}
                min={0}
                step={1}
                placeholder="0"
                value={row.price}
                onValueChange={(v) => update(i, "price", v)}
                state={state?.fieldErrors?.variants ? "error" : "default"}
              />
            </div>
            <Button
              as="button"
              type="button"
              variant="text"
              color="error"
              size="sm"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 1}
              aria-label="Remove variant"
              className={i === 0 ? "mt-5" : ""}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <FormError message={state?.fieldErrors?.variants} />

      <Button
        as="button"
        type="button"
        variant="primary"
        size="sm"
        onClick={addRow}
        startIcon={<Plus size={14} />}
        className="self-end"
      >
        Add variant
      </Button>
    </SectionCard>
  );
}

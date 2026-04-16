"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  FormLabel,
  FormNumberInput,
  FormError,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";
import { emptyRow, initRows, type PresetRow } from "./presets";

export function PresetsSection({ mix, options, state }: SectionProps) {
  const [rows, setRows] = useState<PresetRow[]>(() => initRows(mix, state));

  const products = options.products;
  const hasError = !!state?.fieldErrors?.presets;

  const update = <K extends keyof PresetRow>(
    index: number,
    field: K,
    value: PresetRow[K],
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      setRows([emptyRow()]);
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const canAddMore = rows.length < products.length;
  const usedProductIds = new Set(rows.map((r) => r.product_id).filter(Boolean));

  return (
    <SectionCard>
      <SectionLabel>Presets</SectionLabel>

      <p className="font-body font-light text-sm text-earth/60 -mt-1">
        Assortment of products available for one cell. Each product can appear
        only once in the box.
      </p>

      <input type="hidden" name="presets" value={JSON.stringify(rows)} />

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const productOptions = products.map((p) => ({
            value: p.id,
            label: p.category_name ? `${p.title} — ${p.category_name}` : p.title,
            disabled: p.id !== row.product_id && usedProductIds.has(p.id),
          }));

          const noProduct = hasError && !row.product_id;
          const badWeight = hasError && row.weight_g <= 0;
          const badPrice = hasError && row.price <= 0;

          return (
            <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex gap-3 items-center sm:contents">
                <div className="flex-1 sm:flex-2 min-w-0">
                  <FormLabel required className={i !== 0 ? "sm:hidden" : ""}>
                    Product
                  </FormLabel>
                  <Select
                    value={row.product_id}
                    onValueChange={(v) => update(i, "product_id", v)}
                    options={productOptions}
                    clearable
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full rounded-xl px-4 h-10 text-sm bg-cream",
                        noProduct
                          ? "border-red-400 focus-visible:ring-red-300/40"
                          : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
                      )}
                    >
                      <SelectValue placeholder="Select product…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(opts) =>
                        opts.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                            disabled={o.disabled}
                          >
                            {o.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormError message={noProduct ? "Product is required" : undefined} />
                </div>

                <div className="shrink-0 sm:hidden">
                  <Button
                    as="button"
                    type="button"
                    variant="text"
                    color="error"
                    size="sm"
                    onClick={() => removeRow(i)}
                    aria-label="Remove preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:contents">
                <div className="sm:flex-1">
                  <FormLabel
                    htmlFor={`preset-weight-${i}`}
                    required
                    className={i !== 0 ? "sm:hidden" : ""}
                  >
                    Weight (g)
                  </FormLabel>
                  <FormNumberInput
                    id={`preset-weight-${i}`}
                    name={`__preset_weight_${i}`}
                    min={0}
                    step={1}
                    placeholder="e.g. 50"
                    value={row.weight_g}
                    onValueChange={(v) => update(i, "weight_g", v)}
                    state={badWeight ? "error" : "default"}
                  />
                  <FormError message={badWeight ? "Weight must be > 0" : undefined} />
                </div>

                <div className="sm:flex-1">
                  <FormLabel
                    htmlFor={`preset-price-${i}`}
                    required
                    className={i !== 0 ? "sm:hidden" : ""}
                  >
                    Price (AED)
                  </FormLabel>
                  <FormNumberInput
                    id={`preset-price-${i}`}
                    name={`__preset_price_${i}`}
                    min={0}
                    step={1}
                    placeholder="0"
                    value={row.price}
                    onValueChange={(v) => update(i, "price", v)}
                    state={badPrice ? "error" : "default"}
                  />
                  <FormError message={badPrice ? "Price must be > 0" : undefined} />
                </div>
              </div>

              <div className={cn("hidden sm:block shrink-0", i === 0 && "mt-5")}>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  color="error"
                  size="sm"
                  onClick={() => removeRow(i)}
                  aria-label="Remove preset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        as="button"
        type="button"
        variant="primary"
        size="sm"
        onClick={addRow}
        disabled={!canAddMore}
        startIcon={<Plus size={14} />}
        className="self-end"
      >
        Add preset
      </Button>
    </SectionCard>
  );
}

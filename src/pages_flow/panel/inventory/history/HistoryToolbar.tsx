"use client";

import { Search } from "lucide-react";
import {
  FormInput,
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectItem,
  MultiSelectTrigger,
} from "@/shared/ui";
import { useFilterBar, useFilterBarMulti } from "@/providers";

const REASON_OPTIONS = [
  { value: "order_paid", label: "Order paid" },
  { value: "restock", label: "Restock" },
  { value: "correction", label: "Correction" },
  { value: "damage", label: "Damage" },
  { value: "manual_adjust", label: "Manual" },
];

interface ProductOption {
  value: string;
  label: string;
}

export function HistoryToolbar({
  productOptions,
}: {
  productOptions: ProductOption[];
}) {
  const search = useFilterBar("search");
  const reason = useFilterBarMulti("reason");
  const product = useFilterBarMulti("product");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 items-start">
      <FormInput
        type="text"
        placeholder="Search by note or product…"
        value={search.value}
        onChange={(e) => search.onValueChange(e.target.value)}
        clearable
        onClear={() => search.onValueChange("")}
        startIcon={<Search size={14} />}
        className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
      />

      <MultiSelect
        value={reason.values}
        onValueChange={reason.onValuesChange}
        options={REASON_OPTIONS}
        clearable
      >
        <MultiSelectTrigger
          placeholder="All reasons"
          maxVisibleTags={2}
          className="rounded-xl px-3 min-h-9! py-1 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />
        <MultiSelectContent searchPlaceholder="Search reason…">
          {(opts) => (
            <>
              {opts.map((o) => (
                <MultiSelectItem
                  key={o.value}
                  value={o.value}
                  searchValue={o.label}
                >
                  {o.label}
                </MultiSelectItem>
              ))}
              <MultiSelectEmpty />
            </>
          )}
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect
        value={product.values}
        onValueChange={product.onValuesChange}
        options={productOptions}
        clearable
      >
        <MultiSelectTrigger
          placeholder="All products"
          maxVisibleTags={2}
          className="rounded-xl px-3 min-h-9! py-1 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />
        <MultiSelectContent searchPlaceholder="Search product…">
          {(opts) => (
            <>
              {opts.map((o) => (
                <MultiSelectItem
                  key={o.value}
                  value={o.value}
                  searchValue={o.label}
                >
                  {o.label}
                </MultiSelectItem>
              ))}
              <MultiSelectEmpty />
            </>
          )}
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}

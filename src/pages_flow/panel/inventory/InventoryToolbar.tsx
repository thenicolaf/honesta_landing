"use client";

import { Search } from "lucide-react";
import {
  FormInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { useFilterBar } from "@/providers";

const STATUS_ITEMS = [
  { value: "in", label: "In stock" },
  { value: "low", label: "Low" },
  { value: "out", label: "Out" },
];

export function InventoryToolbar() {
  const search = useFilterBar("search");
  const status = useFilterBar("status");

  return (
    <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-end">
      <FormInput
        type="text"
        placeholder="Search by product name…"
        value={search.value}
        onChange={(e) => search.onValueChange(e.target.value)}
        clearable
        onClear={() => search.onValueChange("")}
        startIcon={<Search size={14} />}
        wrapperClassName="w-full lg:flex-1"
        className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
      />

      <Select
        value={status.value}
        onValueChange={status.onValueChange}
        options={STATUS_ITEMS}
        clearable
      >
        <SelectTrigger className="w-full lg:w-44 h-9">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {(options) =>
            options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import { ArrowUpDown, Search } from "lucide-react";
import {
  FormInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import type { FilteredMixes } from "./useFilteredMixes";

const STATUS_ITEMS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const SORT_OPTIONS = [
  { value: "sort_order", label: "Sort order" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
];

export function MixesToolbar({ filters }: { filters: FilteredMixes }) {
  const { statusFilter, searchFilter, sortFilter } = filters;

  return (
    <div className="flex flex-col gap-3 mb-6 xl:flex-row xl:items-end">
      <FormInput
        type="text"
        placeholder="Search by name, product…"
        value={searchFilter.value}
        onChange={(e) => searchFilter.onValueChange(e.target.value)}
        clearable
        onClear={() => searchFilter.onValueChange("")}
        startIcon={<Search size={14} />}
        wrapperClassName="w-full xl:flex-1"
        className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:contents">
        <Select
          value={statusFilter.value}
          onValueChange={statusFilter.onValueChange}
          options={STATUS_ITEMS}
          clearable
        >
          <SelectTrigger className="w-full xl:w-44 h-9">
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

        <Select
          value={sortFilter.value}
          onValueChange={sortFilter.onValueChange}
          options={SORT_OPTIONS}
          clearable
        >
          <SelectTrigger className="w-full xl:w-48 h-9">
            <ArrowUpDown size={12} className="shrink-0 mr-1.5 text-earth/40" />
            <SelectValue placeholder="Sort order" className="mr-auto" />
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
    </div>
  );
}

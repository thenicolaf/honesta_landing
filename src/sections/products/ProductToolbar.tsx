"use client";

import { ArrowUpDown, Search } from "lucide-react";
import {
  FormInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  ViewModeToggle,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { DbProductGridProps } from "./types";
import type { ProductSortKey } from "./utils";
import type { FilteredProducts } from "./useFilteredProducts";

const MARK_ITEMS = [
  { value: "best_seller", label: "Best Sellers" },
  { value: "promotions", label: "Promotions" },
  { value: "new", label: "New" },
];

const SORT_OPTIONS: { value: ProductSortKey; label: string }[] = [
  { value: "promotions", label: "Promotions" },
  { value: "best_sellers", label: "Best Sellers" },
  { value: "new", label: "New" },
];

export function ProductToolbar({
  categories,
  filters,
}: {
  categories: DbProductGridProps["categories"];
  filters: FilteredProducts;
}) {
  const { sortDisabled, categoryFilter, sortFilter, searchFilter, markFilter } =
    filters;

  return (
    <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Toggle + search share one row on all resolutions */}
      <div className="flex items-center gap-3 lg:contents">
        <ViewModeToggle />
        <FormInput
          type="text"
          placeholder="Search by name, tag, category..."
          value={searchFilter.value}
          onChange={(e) => searchFilter.onValueChange(e.target.value)}
          clearable
          onClear={() => searchFilter.onValueChange("")}
          startIcon={<Search size={14} />}
          wrapperClassName="grow lg:flex-1"
          className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:contents">
        <Select
          value={categoryFilter.value}
          onValueChange={categoryFilter.onValueChange}
          options={(categories ?? []).map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          clearable
        >
          <SelectTrigger className="w-full lg:w-56 h-9">
            <SelectValue placeholder="All Categories" />
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
          value={markFilter.value}
          onValueChange={markFilter.onValueChange}
          options={MARK_ITEMS}
          clearable
        >
          <SelectTrigger className="w-full lg:w-44 h-9">
            <SelectValue placeholder="All" />
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
          <SelectTrigger
            className={cn(
              "w-full lg:w-48 h-9",
              sortDisabled && "opacity-50 pointer-events-none",
            )}
          >
            <ArrowUpDown size={12} className="shrink-0 mr-1.5 text-earth/40" />
            <SelectValue placeholder="By Category" className="mr-auto" />
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

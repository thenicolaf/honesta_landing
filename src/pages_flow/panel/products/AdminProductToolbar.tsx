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
import { ProductStatus } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import type { ProductSortKey } from "@/sections/products/utils/sortProducts";
import type { FilteredAdminProducts } from "./useFilteredAdminProducts";

const STATUS_ITEMS = [
  { value: ProductStatus.DRAFT, label: "Draft" },
  { value: ProductStatus.PUBLISHED, label: "Published" },
  { value: ProductStatus.ARCHIVED, label: "Archived" },
];

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

export function AdminProductToolbar({
  categoryItems,
  filters,
}: {
  categoryItems: { value: string; label: string }[];
  filters: FilteredAdminProducts;
}) {
  const {
    sortDisabled,
    statusFilter,
    categoryFilter,
    sortFilter,
    searchFilter,
    markFilter,
  } = filters;

  return (
    <div className="flex flex-col gap-3 mb-6 2xl:flex-row 2xl:items-end">
      <FormInput
        type="text"
        placeholder="Search by name, tag, category..."
        value={searchFilter.value}
        onChange={(e) => searchFilter.onValueChange(e.target.value)}
        clearable
        onClear={() => searchFilter.onValueChange("")}
        startIcon={<Search size={14} />}
        wrapperClassName="w-full 2xl:flex-1"
        className="h-9 text-sm bg-white-warm! border-earth/15! hover:border-earth/35!"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 2xl:contents">
        <Select
          value={statusFilter.value}
          onValueChange={statusFilter.onValueChange}
          options={STATUS_ITEMS}
          clearable
        >
          <SelectTrigger className="w-full 2xl:w-44 h-9">
            <SelectValue placeholder="All Statuses" />
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

        {categoryItems.length > 1 && (
          <Select
            value={categoryFilter.value}
            onValueChange={categoryFilter.onValueChange}
            options={categoryItems}
            clearable
          >
            <SelectTrigger className="w-full 2xl:w-56 h-9">
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
        )}

        <Select
          value={markFilter.value}
          onValueChange={markFilter.onValueChange}
          options={MARK_ITEMS}
          clearable
        >
          <SelectTrigger className="w-full 2xl:w-44 h-9">
            <SelectValue placeholder="All Marks" />
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
          <SelectTrigger className={cn("w-full 2xl:w-48 h-9", sortDisabled && "opacity-50 pointer-events-none")}>
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

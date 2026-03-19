"use client";

import { FormInput, FormSelect, FormLabel } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";
import { ORDER_STATUS_OPTIONS } from "./helpers";

const FULFILLED_OPTIONS = [
  { value: "no", label: "Unfulfilled" },
  { value: "yes", label: "Fulfilled" },
];

export function OrderFilters() {
  const searchFilter = useFilterBar("search");
  const statusFilter = useFilterBar("status");
  const fulfilledFilter = useFilterBar("fulfilled");
  const pageFilter = useFilterBar("page");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_180px] gap-3 mb-6">
      <div>
        <FormLabel htmlFor="order-search" className="sr-only">
          Search
        </FormLabel>
        <FormInput
          id="order-search"
          placeholder="Search by name, email, phone, or order ID…"
          className="bg-white-warm"
          value={searchFilter.value}
          clearable
          onClear={() => {
            searchFilter.onValueChange("");
            pageFilter.onValueChange("");
          }}
          onChange={(e) => {
            searchFilter.onValueChange(e.target.value);
            pageFilter.onValueChange("");
          }}
        />
      </div>
      <div>
        <FormLabel htmlFor="order-status" className="sr-only">
          Status
        </FormLabel>
        <FormSelect
          id="order-status"
          name="status"
          triggerClassName="bg-white-warm"
          value={statusFilter.value}
          placeholder="All Statuses"
          options={ORDER_STATUS_OPTIONS}
          clearable
          onValueChange={(v) => {
            statusFilter.onValueChange(v);
            pageFilter.onValueChange("");
          }}
        />
      </div>
      <div>
        <FormLabel htmlFor="order-fulfilled" className="sr-only">
          Fulfilled
        </FormLabel>
        <FormSelect
          id="order-fulfilled"
          name="fulfilled"
          triggerClassName="bg-white-warm"
          value={fulfilledFilter.value}
          placeholder="All Orders"
          options={FULFILLED_OPTIONS}
          clearable
          onValueChange={(v) => {
            fulfilledFilter.onValueChange(v);
            pageFilter.onValueChange("");
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { FormInput, FormSelect, FormLabel } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";
import { BUSINESS_TYPE_OPTIONS } from "./helpers";

export function InquiryFilters() {
  const searchFilter = useFilterBar("search");
  const typeFilter = useFilterBar("type");
  const pageFilter = useFilterBar("page");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 mb-6">
      <div>
        <FormLabel htmlFor="inquiry-search" className="sr-only">
          Search
        </FormLabel>
        <FormInput
          id="inquiry-search"
          placeholder="Search by business, contact, or phone…"
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
        <FormLabel htmlFor="inquiry-type" className="sr-only">
          Business Type
        </FormLabel>
        <FormSelect
          id="inquiry-type"
          name="type"
          triggerClassName="bg-white-warm"
          value={typeFilter.value}
          placeholder="All Types"
          options={BUSINESS_TYPE_OPTIONS}
          clearable
          onValueChange={(v) => {
            typeFilter.onValueChange(v);
            pageFilter.onValueChange("");
          }}
        />
      </div>
    </div>
  );
}

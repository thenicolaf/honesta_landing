"use client";

import { FormInput, FormSelect, FormLabel } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const HAS_ORDERS_OPTIONS = [
  { value: "yes", label: "With orders" },
  { value: "no", label: "No orders" },
];

export function UserFilters() {
  const searchFilter = useFilterBar("search");
  const genderFilter = useFilterBar("gender");
  const hasOrdersFilter = useFilterBar("hasOrders");
  const pageFilter = useFilterBar("page");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_180px] gap-3 mb-6">
      <div>
        <FormLabel htmlFor="user-search" className="sr-only">
          Search
        </FormLabel>
        <FormInput
          id="user-search"
          placeholder="Search by name, email, or phone…"
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
        <FormLabel htmlFor="user-gender" className="sr-only">
          Gender
        </FormLabel>
        <FormSelect
          id="user-gender"
          name="gender"
          triggerClassName="bg-white-warm"
          value={genderFilter.value}
          placeholder="All genders"
          options={GENDER_OPTIONS}
          clearable
          onValueChange={(v) => {
            genderFilter.onValueChange(v);
            pageFilter.onValueChange("");
          }}
        />
      </div>
      <div>
        <FormLabel htmlFor="user-has-orders" className="sr-only">
          Orders
        </FormLabel>
        <FormSelect
          id="user-has-orders"
          name="hasOrders"
          triggerClassName="bg-white-warm"
          value={hasOrdersFilter.value}
          placeholder="All users"
          options={HAS_ORDERS_OPTIONS}
          clearable
          onValueChange={(v) => {
            hasOrdersFilter.onValueChange(v);
            pageFilter.onValueChange("");
          }}
        />
      </div>
    </div>
  );
}

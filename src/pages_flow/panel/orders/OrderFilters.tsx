"use client";

import { FormInput, FormSelect, FormLabel, FormDatePicker } from "@/shared/ui";
import { useFilterBar } from "@/providers/FilterProvider";
import { toDateOnlyString, fromDateOnlyString } from "@/shared/utils/zonedTime";
import { ORDER_STATUS_OPTIONS } from "./helpers";

const FULFILLED_OPTIONS = [
  { value: "no", label: "Unfulfilled" },
  { value: "yes", label: "Fulfilled" },
];

export function OrderFilters() {
  const searchFilter = useFilterBar("search");
  const statusFilter = useFilterBar("status");
  const fulfilledFilter = useFilterBar("fulfilled");
  const promoFilter = useFilterBar("promo");
  const dateFromFilter = useFilterBar("dateFrom");
  const dateToFilter = useFilterBar("dateTo");
  const pageFilter = useFilterBar("page");

  const dateFrom = dateFromFilter.value
    ? fromDateOnlyString(dateFromFilter.value)
    : undefined;
  const dateTo = dateToFilter.value
    ? fromDateOnlyString(dateToFilter.value)
    : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
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
        <FormLabel htmlFor="order-promo" className="sr-only">
          Promo code
        </FormLabel>
        <FormInput
          id="order-promo"
          placeholder="Promo code…"
          className="bg-white-warm"
          value={promoFilter.value}
          clearable
          onClear={() => {
            promoFilter.onValueChange("");
            pageFilter.onValueChange("");
          }}
          onChange={(e) => {
            promoFilter.onValueChange(e.target.value);
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
      <div>
        <FormLabel htmlFor="order-date-from" className="sr-only">
          Start date
        </FormLabel>
        <FormDatePicker
          id="order-date-from"
          name="dateFrom"
          placeholder="From date"
          className="[&_input]:bg-white-warm"
          clearable
          value={dateFrom}
          maxDate={dateTo}
          onValueChange={(d) => {
            dateFromFilter.onValueChange(d ? toDateOnlyString(d) : "");
            pageFilter.onValueChange("");
          }}
        />
      </div>
      <div>
        <FormLabel htmlFor="order-date-to" className="sr-only">
          End date
        </FormLabel>
        <FormDatePicker
          id="order-date-to"
          name="dateTo"
          placeholder="To date"
          className="[&_input]:bg-white-warm"
          clearable
          value={dateTo}
          minDate={dateFrom}
          onValueChange={(d) => {
            dateToFilter.onValueChange(d ? toDateOnlyString(d) : "");
            pageFilter.onValueChange("");
          }}
        />
      </div>
    </div>
  );
}

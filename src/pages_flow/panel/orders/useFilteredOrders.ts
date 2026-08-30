"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import { fromDateOnlyString } from "@/shared/utils/zonedTime";
import type { AdminOrder } from "@/pages_flow/orders/types";

const DAY_MS = 86_400_000;

function buildSearchIndex(orders: AdminOrder[]): string[] {
  return orders.map((o) =>
    `${o.id} ${o.first_name} ${o.last_name} ${o.email} ${o.phone}`.toLowerCase(),
  );
}

export function useFilteredOrders(orders: AdminOrder[]) {
  const searchFilter = useFilterBar("search");
  const statusFilter = useFilterBar("status");
  const fulfilledFilter = useFilterBar("fulfilled");
  const promoFilter = useFilterBar("promo");
  const dateFromFilter = useFilterBar("dateFrom");
  const dateToFilter = useFilterBar("dateTo");

  const searchIndex = useMemo(
    () => buildSearchIndex(orders),
    [orders],
  );

  const promoIndex = useMemo(
    () => orders.map((o) => (o.promo_code?.code ?? "").toLowerCase()),
    [orders],
  );

  const deferredSearch = useDeferredValue(searchFilter.value);
  const deferredPromo = useDeferredValue(promoFilter.value);

  const filtered = useMemo(() => {
    const searchVal = deferredSearch.trim().toLowerCase();
    const promoVal = deferredPromo.trim().toLowerCase();
    const status = statusFilter.value;
    const fulfilled = fulfilledFilter.value;
    const fromMs = dateFromFilter.value
      ? fromDateOnlyString(dateFromFilter.value).getTime()
      : null;
    // inclusive — up to the last millisecond of the selected day
    const toMs = dateToFilter.value
      ? fromDateOnlyString(dateToFilter.value).getTime() + DAY_MS - 1
      : null;

    return orders.filter((o, i) => {
      if (status && o.status !== status) return false;
      if (fulfilled === "yes" && !o.is_fulfilled) return false;
      if (fulfilled === "no" && o.is_fulfilled) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      if (promoVal && !promoIndex[i].includes(promoVal)) return false;
      if (fromMs !== null || toMs !== null) {
        const ts = new Date(o.created_at).getTime();
        if (fromMs !== null && ts < fromMs) return false;
        if (toMs !== null && ts > toMs) return false;
      }
      return true;
    });
  }, [
    orders,
    searchIndex,
    promoIndex,
    statusFilter.value,
    deferredSearch,
    deferredPromo,
    fulfilledFilter.value,
    dateFromFilter.value,
    dateToFilter.value,
  ]);

  return {
    filtered,
    searchFilter,
    statusFilter,
    fulfilledFilter,
    promoFilter,
    dateFromFilter,
    dateToFilter,
  };
}

"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import type { AdminOrder } from "@/pages_flow/orders/types";

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

    return orders.filter((o, i) => {
      if (status && o.status !== status) return false;
      if (fulfilled === "yes" && !o.is_fulfilled) return false;
      if (fulfilled === "no" && o.is_fulfilled) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      if (promoVal && !promoIndex[i].includes(promoVal)) return false;
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
  ]);

  return {
    filtered,
    searchFilter,
    statusFilter,
    fulfilledFilter,
    promoFilter,
  };
}

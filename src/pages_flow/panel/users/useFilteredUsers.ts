"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import type { AdminUser } from "./types";

function buildSearchIndex(users: AdminUser[]): string[] {
  return users.map((u) =>
    `${u.id} ${u.firstName ?? ""} ${u.lastName ?? ""} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase(),
  );
}

export function useFilteredUsers(users: AdminUser[]) {
  const searchFilter = useFilterBar("search");
  const genderFilter = useFilterBar("gender");
  const hasOrdersFilter = useFilterBar("hasOrders");

  const searchIndex = useMemo(() => buildSearchIndex(users), [users]);
  const deferredSearch = useDeferredValue(searchFilter.value);

  const filtered = useMemo(() => {
    const searchVal = deferredSearch.trim().toLowerCase();
    const gender = genderFilter.value;
    const hasOrders = hasOrdersFilter.value;

    return users.filter((u, i) => {
      if (gender && u.gender !== gender) return false;
      if (hasOrders === "yes" && u.orderCount === 0) return false;
      if (hasOrders === "no" && u.orderCount > 0) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      return true;
    });
  }, [
    users,
    searchIndex,
    deferredSearch,
    genderFilter.value,
    hasOrdersFilter.value,
  ]);

  return { filtered, searchFilter, genderFilter, hasOrdersFilter };
}

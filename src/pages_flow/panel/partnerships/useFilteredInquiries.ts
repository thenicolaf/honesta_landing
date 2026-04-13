"use client";

import { useMemo, useDeferredValue } from "react";
import { useFilterBar } from "@/providers/FilterProvider";
import type { PartnershipInquiry } from "./types";

function buildSearchIndex(inquiries: PartnershipInquiry[]): string[] {
  return inquiries.map((i) =>
    `${i.business_name} ${i.contact_name} ${i.phone}`.toLowerCase(),
  );
}

export function useFilteredInquiries(inquiries: PartnershipInquiry[]) {
  const searchFilter = useFilterBar("search");
  const typeFilter = useFilterBar("type");

  const searchIndex = useMemo(
    () => buildSearchIndex(inquiries),
    [inquiries],
  );

  const deferredSearch = useDeferredValue(searchFilter.value);

  const filtered = useMemo(() => {
    const searchVal = deferredSearch.trim().toLowerCase();
    const type = typeFilter.value;

    return inquiries.filter((inq, i) => {
      if (type && inq.business_type !== type) return false;
      if (searchVal && !searchIndex[i].includes(searchVal)) return false;
      return true;
    });
  }, [
    inquiries,
    searchIndex,
    deferredSearch,
    typeFilter.value,
  ]);

  return {
    filtered,
    searchFilter,
    typeFilter,
  };
}

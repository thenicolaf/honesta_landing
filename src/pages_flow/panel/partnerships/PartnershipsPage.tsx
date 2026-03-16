"use client";

import { useMemo } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { DataTable } from "@/shared/ui";
import { Handshake } from "lucide-react";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { useFilterBar } from "@/providers/FilterProvider";
import { inquiryColumns } from "./columns";
import { filterInquiries } from "./helpers";
import { useInquiriesTable } from "./useInquiriesTable";
import { InquiryFilters } from "./InquiryFilters";
import { InquiryCards } from "./InquiryCards";
import type { PartnershipInquiry } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_KEYS = ["search", "type", "sortKey", "sortDir", "page", "pageSize"];

// ─── Inner (consumes filter context) ──────────────────────────────────────────

function PartnershipsInner({ inquiries }: { inquiries: PartnershipInquiry[] }) {
  const searchFilter = useFilterBar("search");
  const typeFilter = useFilterBar("type");

  const filtered = useMemo(
    () => filterInquiries(inquiries, typeFilter.value, searchFilter.value),
    [inquiries, typeFilter.value, searchFilter.value],
  );

  const { paginatedData, sort, onSort, pagination } = useInquiriesTable(
    filtered,
    inquiryColumns,
  );

  const hasFilters = !!(searchFilter.value || typeFilter.value);

  const emptyDescription = hasFilters
    ? "Try adjusting filters to find what you're looking for."
    : "Partnership inquiries will appear here once submitted.";

  return (
    <>
      <InquiryFilters />

      {/* Mobile: cards */}
      <div className="xl:hidden">
        <InquiryCards
          inquiries={paginatedData}
          emptyDescription={emptyDescription}
        />
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block">
        <DataTable
          data={paginatedData}
          columns={inquiryColumns}
          keyExtractor={(i) => i.id}
          sort={sort}
          onSort={onSort}
          pagination={pagination}
          wrapperClassName="max-h-[70vh]"
          emptyIcon={<Handshake className="w-10 h-10 text-earth/15" />}
          emptyLabel="No inquiries found"
          emptyDescription={emptyDescription}
        />
      </div>
    </>
  );
}

// ─── PartnershipsPage ─────────────────────────────────────────────────────────

export function PartnershipsPage({ inquiries }: { inquiries: PartnershipInquiry[] }) {
  return (
    <>
      <AdminPageHeader title="Partnerships" />

      <SearchParamsFilterProvider keys={FILTER_KEYS}>
        <PartnershipsInner inquiries={inquiries} />
      </SearchParamsFilterProvider>
    </>
  );
}

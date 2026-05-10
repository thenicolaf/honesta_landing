"use client";

import { DataTable, DataCardPagination } from "@/shared/ui";
import { Handshake } from "lucide-react";
import { inquiryColumns } from "./columns";
import { useAutoRouterRefresh } from "@/shared/hooks/useAutoRouterRefresh";
import { useFilteredInquiries } from "./useFilteredInquiries";
import { useInquiriesTable } from "./useInquiriesTable";
import { InquiryFilters } from "./InquiryFilters";
import { InquiryCards } from "./InquiryCards";
import type { PartnershipInquiry } from "./types";

export function PartnershipsInner({
  inquiries,
}: {
  inquiries: PartnershipInquiry[];
}) {
  useAutoRouterRefresh(["panel-partnerships-refresh"]);
  const { filtered, searchFilter, typeFilter } = useFilteredInquiries(inquiries);

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
        <DataCardPagination pagination={pagination} />
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

import type { ColumnDef } from "@/shared/ui";
import {
  formatDateTime,
  compareDate,
  compareString,
} from "@/shared/ui/Table";
import { displayAddress } from "@/shared/utils/address";
import type { PartnershipInquiry } from "./types";

type InquiryKey =
  | "business"
  | "contact"
  | "message"
  | "address"
  | "date";

export const businessColumn: ColumnDef<PartnershipInquiry, InquiryKey> = {
  key: "business",
  header: "Business",
  cell: (i) => (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-sm">{i.business_name}</span>
      {i.business_type && (
        <span className="text-2xs text-earth/50">{i.business_type}</span>
      )}
    </div>
  ),
  sortable: true,
  compare: compareString((i) => i.business_name),
  headerClassName: "min-w-48",
};

export const contactColumn: ColumnDef<PartnershipInquiry, InquiryKey> = {
  key: "contact",
  header: "Contact",
  cell: (i) => (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-sm">{i.contact_name}</span>
      <span className="text-2xs text-earth/40">{i.phone}</span>
    </div>
  ),
  sortable: true,
  compare: compareString((i) => i.contact_name),
  headerClassName: "min-w-44",
};

export const messageColumn: ColumnDef<PartnershipInquiry, InquiryKey> = {
  key: "message",
  header: "Message",
  cell: (i) =>
    i.message ? (
      <span className="text-2xs text-earth/60 line-clamp-3 italic">
        {i.message}
      </span>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  headerClassName: "min-w-52",
};

export const addressColumn: ColumnDef<PartnershipInquiry, InquiryKey> = {
  key: "address",
  header: "Address",
  cell: (i) =>
    i.address ? (
      <span className="text-2xs text-earth/60 line-clamp-2">{displayAddress(i.address)}</span>
    ) : (
      <span className="text-2xs text-earth/20">—</span>
    ),
  headerClassName: "min-w-44",
};

export const dateColumn: ColumnDef<PartnershipInquiry, InquiryKey> = {
  key: "date",
  header: "Date",
  cell: (i) => (
    <span className="text-2xs text-earth/60 whitespace-nowrap">
      {formatDateTime(i.created_at)}
    </span>
  ),
  sortable: true,
  compare: compareDate((i) => i.created_at),
  headerClassName: "min-w-40",
};

export const inquiryColumns: ColumnDef<PartnershipInquiry, InquiryKey>[] = [
  businessColumn,
  contactColumn,
  messageColumn,
  addressColumn,
  dateColumn,
];

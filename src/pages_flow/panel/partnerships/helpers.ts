import { BUSINESS_TYPES } from "@/sections/partnership/consts";
import type { PartnershipInquiry } from "./types";

// ─── Business type filter options ───────────────────────────────────────────

export const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPES.map((t) => ({
  value: t,
  label: t,
}));

// ─── Search ─────────────────────────────────────────────────────────────────

export function searchInquiry(
  inquiry: PartnershipInquiry,
  term: string,
): boolean {
  const haystack =
    `${inquiry.business_name} ${inquiry.contact_name} ${inquiry.phone}`.toLowerCase();
  return haystack.includes(term);
}

// ─── Filter pipeline ────────────────────────────────────────────────────────

export function filterInquiries(
  inquiries: PartnershipInquiry[],
  businessType: string,
  search: string,
): PartnershipInquiry[] {
  let result = inquiries;

  if (businessType) {
    result = result.filter((i) => i.business_type === businessType);
  }

  const trimmed = search.trim().toLowerCase();
  if (trimmed) {
    result = result.filter((i) => searchInquiry(i, trimmed));
  }

  return result;
}

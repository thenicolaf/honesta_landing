export interface PartnershipInquiry {
  business_name: string;
  contact_name: string;
  phone: string;
  business_type: string;
  message: string;
  address?: string;
  lat?: string;
  lng?: string;
}

export type PartnershipErrors = Partial<
  Record<keyof PartnershipInquiry, string>
>;

import { validatePhone } from "./validatePhone";

export function validatePartnership(
  data: Partial<PartnershipInquiry>,
): PartnershipErrors | null {
  const errors: PartnershipErrors = {};

  if (!data.business_name?.trim()) {
    errors.business_name = "Business name is required";
  }
  if (!data.contact_name?.trim()) {
    errors.contact_name = "Contact name is required";
  }
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  return Object.keys(errors).length > 0 ? errors : null;
}

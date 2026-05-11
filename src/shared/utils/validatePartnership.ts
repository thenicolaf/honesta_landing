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
> & {
  emirate?: string;
  addressCity?: string;
  addressArea?: string;
  addressBuilding?: string;
  addressFlat?: string;
};

import { validatePhone } from "./validatePhone";

export function validatePartnership(
  data: Partial<PartnershipInquiry> & Record<string, unknown>,
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

  // Address: all-or-nothing — if any field filled, all 5 required
  const emirate = (data.emirate as string | undefined)?.trim();
  const city = (data.addressCity as string | undefined)?.trim();
  const area = (data.addressArea as string | undefined)?.trim();
  const building = (data.addressBuilding as string | undefined)?.trim();
  const flat = (data.addressFlat as string | undefined)?.trim();

  const anyFilled = [emirate, city, area, building, flat].some(Boolean);
  if (anyFilled) {
    if (!emirate) errors.emirate = "Emirate is required.";
    if (!city) errors.addressCity = "City is required.";
    if (!area) errors.addressArea = "Area is required.";
    if (!building) errors.addressBuilding = "Building is required.";
    if (!flat) errors.addressFlat = "Flat / Villa is required.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

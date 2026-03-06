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
  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

import type { CustomerInfo } from "@/shared/types";
import { validatePhone } from "./validatePhone";

export type CustomerErrors = Partial<Record<keyof CustomerInfo, string>> & {
  emirate?: string;
  addressCity?: string;
  addressArea?: string;
  addressBuilding?: string;
};

export function validateCustomer(
  customer: Partial<CustomerInfo> & Record<string, unknown>,
): CustomerErrors | null {
  const errors: CustomerErrors = {};

  if (!customer.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }
  if (!customer.lastName?.trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!customer.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = "Enter a valid email address.";
  }
  const phoneError = validatePhone(customer.phone);
  if (phoneError) errors.phone = phoneError;

  const emirate = (customer.emirate as string | undefined)?.trim();
  const addressCity = (customer.addressCity as string | undefined)?.trim();
  const addressArea = (customer.addressArea as string | undefined)?.trim();
  const addressBuilding = (
    customer.addressBuilding as string | undefined
  )?.trim();

  if (!emirate) errors.emirate = "Emirate is required.";
  if (!addressCity) errors.addressCity = "City is required.";
  if (!addressArea) errors.addressArea = "Area is required.";
  if (!addressBuilding) errors.addressBuilding = "Building is required.";

  return Object.keys(errors).length > 0 ? errors : null;
}

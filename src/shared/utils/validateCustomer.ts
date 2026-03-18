import type { CustomerInfo } from "@/shared/types";
import { validatePhone } from "./validatePhone";

export type CustomerErrors = Partial<Record<keyof CustomerInfo, string>>;

export function validateCustomer(
  customer: Partial<CustomerInfo>,
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
  if (!customer.address?.trim()) {
    errors.address = "Delivery address is required.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

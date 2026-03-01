import type { CustomerInfo } from "@/shared/types";

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
  if (!customer.phone?.trim()) {
    errors.phone = "Phone is required.";
  } else if (!/^\+971[0-9]{9}$/.test(customer.phone)) {
    errors.phone =
      "Phone must start with +971 followed by 9 digits (e.g. +971501234567).";
  }
  if (!customer.address?.trim()) {
    errors.address = "Delivery address is required.";
  }
  if (!customer.district?.trim()) {
    errors.district = "Please select a district.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

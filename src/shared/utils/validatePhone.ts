import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Validates a phone string in E.164 format (e.g. +971501234567).
 * Returns an error message or null.
 */
export function validatePhone(
  phone: string | undefined,
  { required = true }: { required?: boolean } = {},
): string | null {
  if (!phone?.trim()) {
    return required ? "Phone is required." : null;
  }

  if (!isValidPhoneNumber(phone)) {
    return "Enter a valid phone number.";
  }

  return null;
}

/**
 * Formats a phone number for display.
 * E.164 input → human-readable international format.
 * Falls back to the raw input if parsing fails.
 */
export function formatPhoneDisplay(raw: string): string {
  try {
    const parsed = parsePhoneNumberFromString(raw);
    return parsed ? parsed.formatInternational() : raw;
  } catch {
    return raw;
  }
}

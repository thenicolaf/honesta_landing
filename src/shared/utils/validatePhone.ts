/**
 * Strips everything except digits from a string.
 * Keeps a leading "+" if present.
 */
function stripNonDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

/**
 * Normalizes a UAE phone number to the canonical +971XXXXXXXXX format.
 *
 * Accepted inputs:
 *   0501234567    → +971501234567
 *   501234567     → +971501234567
 *   +971501234567 → +971501234567
 *   971501234567  → +971501234567
 *
 * Returns the normalized string, or the cleaned digits if it can't be normalized.
 */
export function normalizePhone(raw: string): string {
  const digits = stripNonDigits(raw);

  // 0XX XXXXXXX → drop leading 0, prepend +971
  if (digits.startsWith("0") && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }
  // 971XXXXXXXXX (12 digits)
  if (digits.startsWith("971") && digits.length === 12) {
    return `+${digits}`;
  }
  // 5XXXXXXXX (9 digits, mobile without prefix)
  if (digits.length === 9 && /^[2-9]/.test(digits)) {
    return `+971${digits}`;
  }

  return raw.trim();
}

/**
 * Formats a phone number for display: 0XX XXX XXXX
 *
 * Input is expected as digits (with or without +971 / 0 prefix).
 */
export function formatPhoneDisplay(raw: string): string {
  const digits = stripNonDigits(raw);

  let local: string;
  if (digits.startsWith("971") && digits.length >= 12) {
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0")) {
    local = digits;
  } else if (digits.length <= 9) {
    local = `0${digits}`;
  } else {
    return raw;
  }

  // Format: 0XX XXX XXXX
  if (local.length <= 3) return local;
  if (local.length <= 6) return `${local.slice(0, 3)} ${local.slice(3)}`;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
}

const PHONE_RE = /^\+971[0-9]{9}$/;

/**
 * Validates a phone string (should already be normalized).
 * Returns an error message or null.
 */
export function validatePhone(
  phone: string | undefined,
  { required = true }: { required?: boolean } = {},
): string | null {
  if (!phone?.trim()) {
    return required ? "Phone is required." : null;
  }

  const normalized = normalizePhone(phone);
  if (!PHONE_RE.test(normalized)) {
    return "Enter a valid UAE phone number (e.g. 050 123 4567).";
  }

  return null;
}

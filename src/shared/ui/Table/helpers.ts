/**
 * Helper factories for common column comparators and cell renderers.
 */

// ─── Comparators ─────────────────────────────────────────────────────────────

/** Compare by a string field (case-insensitive). */
export function compareString<T>(accessor: (item: T) => string) {
  return (a: T, b: T) =>
    accessor(a).localeCompare(accessor(b), undefined, { sensitivity: "base" });
}

/** Compare by a numeric field. */
export function compareNumber<T>(accessor: (item: T) => number) {
  return (a: T, b: T) => accessor(a) - accessor(b);
}

/** Compare by a date field (string or Date). */
export function compareDate<T>(accessor: (item: T) => string | Date) {
  return (a: T, b: T) => {
    const da = new Date(accessor(a)).getTime();
    const db = new Date(accessor(b)).getTime();
    return da - db;
  };
}

/** Compare by a boolean field (false < true). */
export function compareBoolean<T>(accessor: (item: T) => boolean) {
  return (a: T, b: T) => Number(accessor(a)) - Number(accessor(b));
}

// ─── Formatters ──────────────────────────────────────────────────────────────

/** Format a number as AED currency. */
export function formatAed(value: number): string {
  return `AED ${Number(value).toFixed(2)}`;
}

/** Format a date string to localized short date. */
export function formatDate(
  dateStr: string,
  locale = "en-GB",
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/** Format a date string to localized date + time. */
export function formatDateTime(
  dateStr: string,
  locale = "en-GB",
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/** Truncate a UUID to first N chars (uppercased). */
export function shortId(id: string, length = 8): string {
  return id.slice(0, length).toUpperCase();
}

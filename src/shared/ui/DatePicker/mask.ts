import type { MaskitoOptions } from "@maskito/core";
import {
  maskitoDateOptionsGenerator,
  maskitoDateTimeOptionsGenerator,
  maskitoTimeOptionsGenerator,
} from "@maskito/kit";
import { format as fnsFormat, isValid, parse, parseISO } from "date-fns";

// ─── Mask options ────────────────────────────────────────────────────────────

const FORMAT_TO_MASK: Record<string, () => MaskitoOptions> = {
  "dd.MM.yyyy": () =>
    maskitoDateOptionsGenerator({ mode: "dd/mm/yyyy", separator: "." }),
  "dd.MM.yyyy HH:mm": () =>
    maskitoDateTimeOptionsGenerator({
      dateMode: "dd/mm/yyyy",
      timeMode: "HH:MM",
      dateSeparator: ".",
      dateTimeSeparator: " ",
    }),
  "HH:mm": () => maskitoTimeOptionsGenerator({ mode: "HH:MM" }),
};

const maskCache = new Map<string, MaskitoOptions>();

export function buildMaskOptions(format: string): MaskitoOptions {
  const cached = maskCache.get(format);
  if (cached) return cached;

  const factory = FORMAT_TO_MASK[format];
  if (!factory) {
    throw new Error(
      `Unsupported DatePicker format: "${format}". Supported: ${Object.keys(FORMAT_TO_MASK).join(", ")}`,
    );
  }

  const options = factory();
  maskCache.set(format, options);
  return options;
}

// ─── Placeholder ─────────────────────────────────────────────────────────────

const PLACEHOLDER_MAP: Record<string, string> = {
  dd: "DD",
  MM: "MM",
  yyyy: "YYYY",
  HH: "HH",
  mm: "MM",
};

export function generatePlaceholder(format: string): string {
  return format.replace(
    /dd|MM|yyyy|HH|mm/g,
    (match) => PLACEHOLDER_MAP[match] ?? match,
  );
}

// ─── Format / Parse ──────────────────────────────────────────────────────────

function isCompleteInput(displayValue: string, format: string): boolean {
  return displayValue.length === format.length;
}

export function formatDateToDisplay(
  date: Date | undefined,
  format: string,
): string {
  if (!date) return "";
  try {
    return fnsFormat(date, format);
  } catch {
    return "";
  }
}

export function parseDateInput(
  displayValue: string,
  format: string,
): Date | undefined {
  if (!displayValue || !isCompleteInput(displayValue, format)) {
    return undefined;
  }

  try {
    const parsed = parse(displayValue, format, new Date());
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function formatISOtoDisplay(
  isoValue: string | undefined,
  format: string,
): string {
  if (!isoValue) return "";
  try {
    const date = parseISO(isoValue);
    return isValid(date) ? fnsFormat(date, format) : "";
  } catch {
    return "";
  }
}

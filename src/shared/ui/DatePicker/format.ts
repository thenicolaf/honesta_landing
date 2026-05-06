import { format } from "date-fns";

interface FormatOptions {
  showTime: boolean;
  timeOnly?: boolean;
}

export function formatDisplay(date: Date, options: FormatOptions): string {
  if (options.timeOnly) return format(date, "HH:mm");
  return format(date, options.showTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
}

export function formatFormValue(date: Date, options: FormatOptions): string {
  if (options.timeOnly) return format(date, "HH:mm");
  return options.showTime ? date.toISOString() : format(date, "yyyy-MM-dd");
}

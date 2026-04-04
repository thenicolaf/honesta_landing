import { format } from "date-fns";

export function formatDisplay(date: Date, showTime: boolean): string {
  return format(date, showTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
}

export function formatFormValue(date: Date, showTime: boolean): string {
  return showTime ? date.toISOString() : format(date, "yyyy-MM-dd");
}

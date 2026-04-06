import { cn } from "@/shared/utils/cn";

export const calendarClassNames = {
  root: "p-3 font-body",
  months: "flex flex-col",
  month: "space-y-3",
  month_caption: "flex items-center justify-between pt-1 pb-2",
  caption_label: "font-body text-base font-medium text-earth",
  nav: "flex items-center gap-1",
  button_previous: cn(
    "p-1.5 rounded-lg transition-colors cursor-pointer",
    "text-earth/50 hover:text-earth hover:bg-earth/5",
  ),
  button_next: cn(
    "p-1.5 rounded-lg transition-colors cursor-pointer",
    "text-earth/50 hover:text-earth hover:bg-earth/5",
  ),
  weekdays: "flex",
  weekday:
    "w-9 text-center font-body text-2xs font-semibold capitalize tracking-wider text-earth/40",
  week: "flex mt-1",
  day: "relative w-9 h-9 flex items-center justify-center",
  day_button: cn(
    "w-8 h-8 rounded-full font-body text-sm transition-colors cursor-pointer",
    "text-earth hover:bg-orange/10",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/40",
  ),
  selected: "[&>button]:bg-orange/20! [&>button]:text-orange! [&>button]:font-medium",
  today: "[&>button]:bg-earth/5 [&>button]:text-earth/50 [&>button]:font-medium",
  outside: "invisible",
  disabled: cn(
    "pointer-events-none",
    "[&>button]:text-earth/20 [&>button]:hover:bg-transparent",
  ),
};

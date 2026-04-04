"use client";

import { DayPicker } from "react-day-picker";
import { format, eachYearOfInterval } from "date-fns";
import { PopoverContent } from "../Popover";
import { Popover, PopoverTrigger, PopoverContent as WheelPopoverContent } from "../Popover";
import { Button } from "../Button";
import { ScrollWheel, type ScrollWheelItem } from "../ScrollWheel";
import { IconChevron } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { usePopover } from "../Popover";
import { useDatePicker } from "./context";
import { calendarClassNames } from "./calendar-classes";
import { useCalendarMonth } from "./hooks/useCalendarMonth";
import { DatePickerTime } from "./DatePickerTime";

// ─── Custom Chevron ──────────────────────────────────────────────────────────

function CustomChevron(props: {
  className?: string;
  size?: number;
  disabled?: boolean;
  orientation?: "up" | "down" | "left" | "right";
}) {
  return (
    <IconChevron
      className={cn(
        "w-4 h-4",
        props.orientation === "left" ? "rotate-90" : "-rotate-90",
      )}
    />
  );
}

// ─── Month & Year wheel data ────────────────────────────────────────────────

const MONTH_ITEMS: ScrollWheelItem[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), "LLLL"),
}));

const now = new Date();
const DEFAULT_MIN_YEAR = now.getFullYear() - 80;
const DEFAULT_MAX_YEAR = now.getFullYear() + 20;

function buildYearItems(minYear: number, maxYear: number): ScrollWheelItem[] {
  return eachYearOfInterval({
    start: new Date(minYear, 0, 1),
    end: new Date(maxYear, 0, 1),
  }).map((date) => ({
    value: String(date.getFullYear()),
    label: String(date.getFullYear()),
  }));
}

// ─── DatePickerContent ───────────────────────────────────────────────────────

interface DatePickerContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function DatePickerContent({
  children,
  className,
}: DatePickerContentProps) {
  const { value, selectDate, minDate, maxDate, showTime } = useDatePicker();
  const { open, close } = usePopover();
  const { displayMonth, setManualMonth } = useCalendarMonth(value, open);

  const minYear = minDate?.getFullYear() ?? DEFAULT_MIN_YEAR;
  const maxYear = maxDate?.getFullYear() ?? DEFAULT_MAX_YEAR;
  const yearItems = buildYearItems(minYear, maxYear);

  // Filter months to those that have at least one selectable day given minDate/maxDate
  const currentYear = displayMonth.getFullYear();
  const monthItems = MONTH_ITEMS.filter((m) => {
    const idx = Number(m.value);
    if (minDate && (currentYear < minDate.getFullYear() ||
      (currentYear === minDate.getFullYear() && idx < minDate.getMonth()))) return false;
    if (maxDate && (currentYear > maxDate.getFullYear() ||
      (currentYear === maxDate.getFullYear() && idx > maxDate.getMonth()))) return false;
    return true;
  });

  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  // Arrow disabled state: can't go further than min/max month
  const prevMonth = new Date(currentYear, displayMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentYear, displayMonth.getMonth() + 1, 1);
  const prevDisabled =
    !!minDate &&
    prevMonth.getFullYear() * 12 + prevMonth.getMonth() <
      minDate.getFullYear() * 12 + minDate.getMonth();
  const nextDisabled =
    !!maxDate &&
    nextMonth.getFullYear() * 12 + nextMonth.getMonth() >
      maxDate.getFullYear() * 12 + maxDate.getMonth();

  return (
    <PopoverContent align="auto" width="w-auto" className={cn("overflow-visible max-w-[calc(100vw-2rem)]", className)}>
      <div className="p-3 font-body">
        {/* Custom header: ← Month ▾  Year ▾ → */}
        <div className="flex items-center justify-between pb-2">
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            disabled={prevDisabled}
            onClick={() =>
              setManualMonth(
                new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1),
              )
            }
            className="w-auto! h-auto! p-1.5! rounded-lg text-earth/50 hover:text-earth hover:bg-earth/5 disabled:opacity-30 disabled:pointer-events-none"
          >
            <IconChevron className="w-4 h-4 rotate-90" />
          </Button>

          <div className="flex items-center gap-0.5">
            {/* Month wheel */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  size="sm"
                  className="normal-case font-body text-base font-medium text-earth hover:text-orange gap-1"
                >
                  {format(displayMonth, "LLLL")}
                  <IconChevron className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <WheelPopoverContent align="left" width="w-auto" className="p-2">
                <ScrollWheel
                  items={monthItems}
                  value={String(displayMonth.getMonth())}
                  onValueChange={(v) =>
                    setManualMonth(new Date(displayMonth.getFullYear(), Number(v), 1))
                  }
                  itemHeight={36}
                  visibleCount={5}
                  className="w-36"
                />
              </WheelPopoverContent>
            </Popover>

            {/* Year wheel */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  size="sm"
                  className="normal-case font-body text-base font-medium text-earth hover:text-orange gap-1"
                >
                  {format(displayMonth, "yyyy")}
                  <IconChevron className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <WheelPopoverContent align="left" width="w-auto" className="p-2">
                <ScrollWheel
                  items={yearItems}
                  value={String(displayMonth.getFullYear())}
                  onValueChange={(v) =>
                    setManualMonth(new Date(Number(v), displayMonth.getMonth(), 1))
                  }
                  itemHeight={36}
                  visibleCount={7}
                  className="w-20"
                />
              </WheelPopoverContent>
            </Popover>
          </div>

          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            disabled={nextDisabled}
            onClick={() =>
              setManualMonth(
                new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
              )
            }
            className="w-auto! h-auto! p-1.5! rounded-lg text-earth/50 hover:text-earth hover:bg-earth/5 disabled:opacity-30 disabled:pointer-events-none"
          >
            <IconChevron className="w-4 h-4 -rotate-90" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (!date) {
                selectDate(undefined);
                if (!showTime) close();
                return;
              }
              let next = date;
              // Preserve existing time when a day is picked in showTime mode
              if (showTime && value) {
                next = new Date(date);
                next.setHours(value.getHours());
                next.setMinutes(value.getMinutes());
                next.setSeconds(value.getSeconds());
              }
              // Clamp to [minDate, maxDate] so preserved time doesn't escape bounds
              if (minDate && next.getTime() < minDate.getTime()) next = new Date(minDate);
              if (maxDate && next.getTime() > maxDate.getTime()) next = new Date(maxDate);
              selectDate(next);
              if (!showTime) close();
            }}
            month={displayMonth}
            onMonthChange={setManualMonth}
            disabled={disabledDays.length > 0 ? disabledDays : undefined}
            classNames={{
              ...calendarClassNames,
              root: "",
              month_caption: "hidden",
              nav: "hidden",
            }}
            components={{ Chevron: CustomChevron }}
          />

          {showTime && (
            <div className="self-stretch flex items-center justify-center border-t sm:border-t-0 sm:border-l border-earth/8 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto">
              <DatePickerTime />
            </div>
          )}
        </div>
      </div>
      {children}
    </PopoverContent>
  );
}

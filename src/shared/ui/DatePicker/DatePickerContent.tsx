"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, eachMonthOfInterval, eachYearOfInterval, startOfYear, endOfYear } from "date-fns";
import { PopoverContent } from "../Popover";
import { Popover, PopoverTrigger, PopoverContent as MonthYearPopoverContent } from "../Popover";
import { Button } from "../Button";
import { IconChevron } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { usePopover } from "../Popover";
import { useDatePicker } from "./context";
import { calendarClassNames } from "./calendar-classes";
import { useCalendarMonth } from "./hooks/useCalendarMonth";

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

// ─── Month/Year Picker ───────────────────────────────────────────────────────

const MONTHS = eachMonthOfInterval({
  start: startOfYear(new Date()),
  end: endOfYear(new Date()),
}).map((date) => ({ label: format(date, "MMM"), index: date.getMonth() }));

const now = new Date();
const YEARS = eachYearOfInterval({
  start: new Date(now.getFullYear() - 80, 0, 1),
  end: new Date(now.getFullYear() + 20, 0, 1),
}).map((date) => date.getFullYear());

function MonthYearPicker({
  displayMonth,
  onMonthChange,
}: {
  displayMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const [view, setView] = useState<"months" | "years">("months");
  const activeMonth = displayMonth.getMonth();
  const activeYear = displayMonth.getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          as="button"
          type="button"
          variant="text"
          size="sm"
          className="normal-case font-body text-base font-medium text-earth hover:text-orange"
        >
          {format(displayMonth, "LLLL yyyy")}
        </Button>
      </PopoverTrigger>
      <MonthYearPopoverContent align="left" width="w-auto" className="p-3">
        {/* Tab switcher */}
        <div className="flex gap-1 mb-2">
          <Button
            as="button"
            type="button"
            variant="text"
            size="sm"
            onClick={() => setView("months")}
            className={cn(
              "flex-1 py-1.5! text-2xs font-semibold normal-case tracking-[0.08em]",
              view === "months"
                ? "bg-sand text-earth"
                : "text-earth/40 hover:text-earth hover:bg-earth/5",
            )}
          >
            Month
          </Button>
          <Button
            as="button"
            type="button"
            variant="text"
            size="sm"
            onClick={() => setView("years")}
            className={cn(
              "flex-1 py-1.5! text-2xs font-semibold normal-case tracking-[0.08em]",
              view === "years"
                ? "bg-sand text-earth"
                : "text-earth/40 hover:text-earth hover:bg-earth/5",
            )}
          >
            Year
          </Button>
        </div>

        {view === "months" ? (
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m) => (
              <Button
                key={m.index}
                as="button"
                type="button"
                variant="text"
                size="sm"
                onClick={() => onMonthChange(new Date(activeYear, m.index, 1))}
                className={cn(
                  "px-3! py-2! text-sm normal-case",
                  m.index === activeMonth
                    ? "bg-sand text-earth font-medium"
                    : "text-earth/70 hover:bg-earth/5 hover:text-earth",
                )}
              >
                {m.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto overscroll-contain flex flex-col gap-0.5">
            {YEARS.map((y) => (
              <Button
                key={y}
                as="button"
                type="button"
                variant="text"
                size="sm"
                onClick={() => onMonthChange(new Date(y, activeMonth, 1))}
                className={cn(
                  "px-4! py-1.5! text-sm justify-start",
                  y === activeYear
                    ? "bg-sand text-earth font-medium"
                    : "text-earth/70 hover:bg-earth/5 hover:text-earth",
                )}
              >
                {y}
              </Button>
            ))}
          </div>
        )}
      </MonthYearPopoverContent>
    </Popover>
  );
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
  const { value, selectDate } = useDatePicker();
  const { open } = usePopover();
  const { displayMonth, setManualMonth } = useCalendarMonth(value, open);

  return (
    <PopoverContent align="left" width="w-auto" className={cn("overflow-visible", className)}>
      <div className="p-3 font-body">
        {/* Custom header: ← MonthYear → */}
        <div className="flex items-center justify-between pb-2">
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            onClick={() =>
              setManualMonth(
                new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1),
              )
            }
            className="w-auto! h-auto! p-1.5! rounded-lg text-earth/50 hover:text-earth hover:bg-earth/5"
          >
            <IconChevron className="w-4 h-4 rotate-90" />
          </Button>

          <MonthYearPicker
            displayMonth={displayMonth}
            onMonthChange={setManualMonth}
          />

          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            onClick={() =>
              setManualMonth(
                new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
              )
            }
            className="w-auto! h-auto! p-1.5! rounded-lg text-earth/50 hover:text-earth hover:bg-earth/5"
          >
            <IconChevron className="w-4 h-4 -rotate-90" />
          </Button>
        </div>

        <DayPicker
          mode="single"
          selected={value}
          onSelect={(date) => selectDate(date ?? undefined)}
          month={displayMonth}
          onMonthChange={setManualMonth}
          classNames={{
            ...calendarClassNames,
            root: "",
            month_caption: "hidden",
            nav: "hidden",
          }}
          components={{ Chevron: CustomChevron }}
        />
      </div>
      {children}
    </PopoverContent>
  );
}

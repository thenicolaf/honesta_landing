"use client";

import { isSameDay } from "date-fns";
import { ScrollWheel, type ScrollWheelItem } from "../ScrollWheel";
import { useDatePicker } from "./context";

export function DatePickerTime() {
  const { value, selectDate, format, minDate, maxDate } = useDatePicker();

  const showSeconds = format.includes("ss");

  // Base date: current value or today at midnight
  const base = value ?? new Date(new Date().setHours(0, 0, 0, 0));
  const hour = base.getHours();
  const minute = base.getMinutes();
  const second = base.getSeconds();

  // Is the current base date equal to the min/max boundary day?
  const atMinDay = minDate && isSameDay(base, minDate);
  const atMaxDay = maxDate && isSameDay(base, maxDate);

  const minHour = atMinDay ? minDate!.getHours() : 0;
  const maxHour = atMaxDay ? maxDate!.getHours() : 23;

  const atMinHour = atMinDay && hour === minHour;
  const atMaxHour = atMaxDay && hour === maxHour;

  const minMinute = atMinHour ? minDate!.getMinutes() : 0;
  const maxMinute = atMaxHour ? maxDate!.getMinutes() : 59;

  const atMinMinute = atMinHour && minute === minMinute;
  const atMaxMinute = atMaxHour && minute === maxMinute;

  const minSecond = atMinMinute ? minDate!.getSeconds() : 0;
  const maxSecond = atMaxMinute ? maxDate!.getSeconds() : 59;

  const HOUR_ITEMS: ScrollWheelItem[] = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, "0"),
    disabled: i < minHour || i > maxHour,
  }));

  const MINUTE_ITEMS: ScrollWheelItem[] = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, "0"),
    disabled: i < minMinute || i > maxMinute,
  }));

  const SECOND_ITEMS: ScrollWheelItem[] = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, "0"),
    disabled: i < minSecond || i > maxSecond,
  }));

  const updateTime = (nextHour: number, nextMinute: number, nextSecond: number) => {
    // When no date is selected, the wheels show a fake "today midnight" base.
    // Programmatic scroll-sync can fire onValueChange with that base — we must
    // not push it back into context, or clearing the field would be reverted.
    if (!value) return;
    const next = new Date(base);
    next.setHours(nextHour);
    next.setMinutes(nextMinute);
    next.setSeconds(nextSecond);
    next.setMilliseconds(0);
    selectDate(next);
  };

  return (
    <div className="flex items-center gap-2">
      <ScrollWheel
        items={HOUR_ITEMS}
        value={String(hour)}
        onValueChange={(v) => updateTime(Number(v), minute, second)}
        itemHeight={32}
        visibleCount={5}
        className="w-14"
      />
      <span className="font-body text-base font-medium text-earth/40 select-none">:</span>
      <ScrollWheel
        items={MINUTE_ITEMS}
        value={String(minute)}
        onValueChange={(v) => updateTime(hour, Number(v), second)}
        itemHeight={32}
        visibleCount={5}
        className="w-14"
      />
      {showSeconds && (
        <>
          <span className="font-body text-base font-medium text-earth/40 select-none">:</span>
          <ScrollWheel
            items={SECOND_ITEMS}
            value={String(second)}
            onValueChange={(v) => updateTime(hour, minute, Number(v))}
            itemHeight={32}
            visibleCount={5}
            className="w-14"
          />
        </>
      )}
    </div>
  );
}

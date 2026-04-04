"use client";

import { ScrollWheel, type ScrollWheelItem } from "../ScrollWheel";
import { useDatePicker } from "./context";

const HOUR_ITEMS: ScrollWheelItem[] = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: String(i).padStart(2, "0"),
}));

const MINUTE_ITEMS: ScrollWheelItem[] = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: String(i).padStart(2, "0"),
}));

const SECOND_ITEMS: ScrollWheelItem[] = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: String(i).padStart(2, "0"),
}));

export function DatePickerTime() {
  const { value, selectDate, format } = useDatePicker();

  const showSeconds = format.includes("ss");

  // Base date: current value or today at midnight
  const base = value ?? new Date(new Date().setHours(0, 0, 0, 0));
  const hour = base.getHours();
  const minute = base.getMinutes();
  const second = base.getSeconds();

  const updateTime = (nextHour: number, nextMinute: number, nextSecond: number) => {
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

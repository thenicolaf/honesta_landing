"use client";

import { cn } from "@/shared/utils/cn";
import { usePopover } from "../Popover";
import { useDatePicker } from "./context";

interface Preset {
  label: string;
  date: Date;
}

interface DatePickerPresetsProps {
  presets: Preset[];
  className?: string;
}

export function DatePickerPresets({
  presets,
  className,
}: DatePickerPresetsProps) {
  const { selectDate } = useDatePicker();
  const { close } = usePopover();

  if (presets.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 px-3 pb-3 border-t border-earth/8 pt-2",
        className,
      )}
    >
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => {
            selectDate(preset.date);
            close();
          }}
          className="px-3 py-1.5 rounded-lg text-2xs font-body font-semibold uppercase tracking-[0.08em] text-earth/50 hover:text-orange hover:bg-earth/5 transition-colors cursor-pointer"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

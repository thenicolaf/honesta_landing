"use client";

import { PopoverContent } from "../Popover";
import { cn } from "@/shared/utils/cn";
import { DatePickerTime } from "./DatePickerTime";

interface DatePickerTimeContentProps {
  className?: string;
}

export function DatePickerTimeContent({ className }: DatePickerTimeContentProps) {
  return (
    <PopoverContent
      align="auto"
      width="w-auto"
      className={cn("overflow-visible", className)}
    >
      <div className="p-3 font-body flex items-center justify-center">
        <DatePickerTime />
      </div>
    </PopoverContent>
  );
}

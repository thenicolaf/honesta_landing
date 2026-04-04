"use client";

import { cn } from "@/shared/utils/cn";
import { useScrollWheel, type ScrollWheelItem } from "./hooks/useScrollWheel";

export type { ScrollWheelItem };

export interface ScrollWheelProps {
  /** Array of selectable items */
  items: ScrollWheelItem[];
  /** Currently selected value */
  value: string;
  /** Called when scroll settles on a new item */
  onValueChange: (value: string) => void;
  /** Height of each item row in px (default: 40) */
  itemHeight?: number;
  /** Number of visible items — must be odd (default: 5) */
  visibleCount?: number;
  className?: string;
}

export function ScrollWheel({
  items,
  value,
  onValueChange,
  itemHeight = 40,
  visibleCount = 5,
  className,
}: ScrollWheelProps) {
  const { containerRef, itemRefs, paddingHeight, scrollToIndex, handleKeyDown } =
    useScrollWheel({
      items,
      value,
      onValueChange,
      itemHeight,
      visibleCount,
    });

  return (
    <div
      className={cn("relative", className)}
      style={{ height: itemHeight * visibleCount }}
    >
      {/* Center highlight overlay */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10 rounded-lg bg-sand/50 border-y border-earth/8"
        style={{
          top: Math.floor(visibleCount / 2) * itemHeight,
          height: itemHeight,
        }}
      />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="h-full overflow-y-auto overscroll-contain focus:outline-none"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        {/* Top spacer */}
        <div style={{ height: paddingHeight }} />

        {items.map((item, i) => (
          <div
            key={item.value}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => !item.disabled && scrollToIndex(i)}
            className={cn(
              "flex items-center justify-center font-body text-sm select-none",
              item.disabled
                ? "text-earth/20 cursor-not-allowed"
                : "text-earth cursor-pointer",
            )}
            style={{
              height: itemHeight,
              scrollSnapAlign: "center",
              transition: "opacity 0.1s, transform 0.1s",
            }}
          >
            {item.label}
          </div>
        ))}

        {/* Bottom spacer */}
        <div style={{ height: paddingHeight }} />
      </div>
    </div>
  );
}

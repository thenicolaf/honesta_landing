"use client";

import { IconX } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export function Tag({ children, onRemove, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg",
        "bg-earth/8 text-earth font-body text-2xs font-medium",
        "px-2.5 py-1 transition-colors duration-150",
        className,
      )}
      {...props}
    >
      <span className="truncate max-w-48">{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }
          }}
          className="shrink-0 rounded-full p-0.5 text-earth/40 hover:text-earth/70 hover:bg-earth/10 transition-colors duration-150 cursor-pointer"
        >
          <IconX className="w-3.5 h-3.5" />
        </span>
      )}
    </span>
  );
}

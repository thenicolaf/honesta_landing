"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/shared/utils/cn";
import { IconX } from "@/shared/icons";
import { Button } from "../Button";

interface SortableThumbnailProps {
  id: string;
  src: string;
  alt: string;
  index: number;
  isMain?: boolean;
  onRemove: () => void;
  onPreview?: () => void;
}

export function SortableThumbnail({
  id,
  src,
  alt,
  index,
  isMain,
  onRemove,
  onPreview,
}: SortableThumbnailProps) {
  const { ref, isDragging } = useSortable({ id, index });

  return (
    <li
      ref={ref}
      onClick={onPreview}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      {isMain && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 bg-orange text-white text-2xs font-body font-semibold px-1.5 py-0.5 rounded-full leading-none">
          Main
        </span>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-20 h-20 rounded-lg object-cover border border-parchment pointer-events-none"
        draggable={false}
      />

      <Button
        as="button"
        type="button"
        onClick={onRemove}
        variant="primary"
        color="error"
        size="icon"
        className="absolute -top-1.5 -right-1.5 w-5! h-5! rounded-full opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
      >
        <IconX className="w-3 h-3" />
      </Button>

      <span className="block mt-1 text-2xs text-earth/40 truncate max-w-20 text-center">
        {alt}
      </span>
    </li>
  );
}

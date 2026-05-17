"use client";

import { useRef } from "react";
import { PointerSensor } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { IconX } from "@/shared/icons";
import { Button } from "../Button";
import { Thumbnail } from "../Thumbnail";

interface SortableThumbnailProps {
  id: string;
  src: string;
  alt: string;
  index: number;
  isMain?: boolean;
  sortable?: boolean;
  onRemove: () => void;
  onPreview?: () => void;
  kind?: "image" | "video";
}

export function SortableThumbnail({
  id,
  src,
  alt,
  index,
  isMain,
  sortable = true,
  onRemove,
  onPreview,
  kind,
}: SortableThumbnailProps) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const { ref, isDragging } = useSortable({
    id,
    index,
    disabled: !sortable,
    handle: handleRef,
    sensors: [
      {
        plugin: PointerSensor,
        options: {
          activationConstraints: () => undefined,
        },
      },
    ],
  });

  return (
    <li ref={ref} className={cn("relative", isDragging && "opacity-40")}>
      {isMain && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 bg-orange text-white text-2xs font-body font-semibold px-1.5 py-0.5 rounded-full leading-none">
          Main
        </span>
      )}

      <Thumbnail src={src} alt={alt} onClick={onPreview} kind={kind}>
        {/* Drag handle */}
        {sortable && (
          <Button
            as="button"
            type="button"
            ref={handleRef}
            variant="primary"
            size="icon"
            className="absolute -bottom-1.5 -left-1.5 w-5! h-5! rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity touch-none"
          >
            <GripVertical size={12} className="pointer-events-none" />
          </Button>
        )}
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
      </Thumbnail>
    </li>
  );
}

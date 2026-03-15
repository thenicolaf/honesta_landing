"use client";

import { cn } from "@/shared/utils/cn";
import { IconX } from "@/shared/icons";
import { Button } from "../Button";

interface ThumbnailProps {
  src: string;
  alt: string;
  onRemove: () => void;
  onPreview?: () => void;
}

export function Thumbnail({ src, alt, onRemove, onPreview }: ThumbnailProps) {
  return (
    <li className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={onPreview}
        className={cn(
          "w-20 h-20 rounded-lg object-cover border border-parchment",
          onPreview && "cursor-zoom-in",
        )}
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

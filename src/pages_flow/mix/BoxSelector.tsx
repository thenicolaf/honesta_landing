"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Badge } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { MixBox } from "@/lib/mixBoxesDb";

interface BoxSelectorProps {
  boxes: MixBox[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function BoxSelector({ boxes, selectedId, onSelect }: BoxSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {boxes.map((box) => {
        const isSelected = box.id === selectedId;
        return (
          <button
            key={box.id}
            type="button"
            onClick={() => onSelect(box.id)}
            className={cn(
              "relative flex flex-col rounded-2xl overflow-hidden bg-white-warm border-2 transition-all duration-200 text-left",
              isSelected
                ? "border-orange shadow-lg"
                : "border-transparent hover:shadow-md",
            )}
          >
            <div className="relative w-full aspect-4/3 bg-sand">
              {box.image_url ? (
                <Image
                  src={box.image_url}
                  alt={box.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-earth/20">
                  <LayoutGrid size={36} />
                </div>
              )}
              <Badge
                variant="counter"
                size="xs"
                className="absolute top-2 left-2 z-10"
              >
                {box.cell_count} CELLS
              </Badge>
            </div>

            <div className="p-3 sm:p-4">
              <p className="font-display font-semibold text-heading text-base sm:text-lg leading-tight">
                {box.name}
              </p>
              {box.description && (
                <p className="font-body font-light text-earth/60 text-xs sm:text-sm mt-1 line-clamp-2">
                  {box.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

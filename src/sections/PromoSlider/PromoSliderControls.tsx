"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

type EmblaApi = UseEmblaCarouselType[1];

interface PromoSliderDotsProps {
  emblaApi: EmblaApi;
  count: number;
  selected: number;
}

export function PromoSliderDots({
  emblaApi,
  count,
  selected,
}: PromoSliderDotsProps) {
  if (count <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Slides"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <Button
          key={i}
          as="button"
          variant="text"
          size="icon"
          role="tab"
          aria-selected={i === selected}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => emblaApi?.scrollTo(i)}
          className={cn(
            "w-2.5 h-2.5 rounded-full p-0 transition-colors",
            i === selected
              ? "bg-orange hover:bg-orange"
              : "bg-parchment hover:bg-earth/30",
          )}
        />
      ))}
    </div>
  );
}

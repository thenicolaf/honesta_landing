"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/sections/products/types";
import { ProductItem } from "@/sections/products/ProductItem";
import { Button } from "@/shared/ui";
import { PromoSliderDots } from "./PromoSliderControls";

interface PromoSliderProps {
  products: Product[];
  /** Origin marker added as `?from=` to product links — drives the back button label on the product detail page. Default: "promo". */
  from?: string;
  /** Full back URL forwarded as `?back=` to nested product links — preserves filter state through chained navigation. */
  backHref?: string;
}

export function PromoSlider({
  products,
  from = "promo",
  backHref,
}: PromoSliderProps) {
  const hasMultiple = products.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultiple, align: "start", containScroll: "trimSnaps" },
    hasMultiple
      ? [
          Autoplay({
            delay: 3000,
            stopOnMouseEnter: true,
            stopOnInteraction: false,
          }),
        ]
      : [],
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Single-product fallback: skip embla entirely (loop+autoplay misbehave with 1 slide).
  if (products.length === 1) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <ProductItem product={products[0]} from={from} backHref={backHref} />
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Top picks and deals"
    >
      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_auto] md:gap-4">
        {products.length > 1 && (
          <Button
            as="button"
            variant="outline"
            size="icon"
            aria-label="Previous slide"
            onClick={() => emblaApi?.scrollPrev()}
            className="hidden md:inline-flex bg-white-warm shadow-md hover:bg-white-warm"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
        <div className="overflow-x-clip min-w-0 py-2" ref={emblaRef}>
          <div className="flex -ml-4">
            {products.map((p, i) => (
              <div
                key={p.id ?? p.slug ?? i}
                className="pl-4 min-w-0 shrink-0 grow-0 basis-[62%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 relative hover:z-20"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${products.length}`}
              >
                <ProductItem product={p} from={from} backHref={backHref} />
              </div>
            ))}
          </div>
        </div>
        {products.length > 1 && (
          <Button
            as="button"
            variant="outline"
            size="icon"
            aria-label="Next slide"
            onClick={() => emblaApi?.scrollNext()}
            className="hidden md:inline-flex bg-white-warm shadow-md hover:bg-white-warm"
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
      <PromoSliderDots
        emblaApi={emblaApi}
        count={products.length}
        selected={selected}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Badge } from "@/shared/ui";

const Gallery = dynamic(
  () => import("@/shared/ui/Gallery").then((m) => m.Gallery),
  { ssr: false },
);
const Lightbox = dynamic(
  () => import("@/shared/ui/Lightbox").then((m) => m.Lightbox),
  { ssr: false },
);

interface ProductDetailImageProps {
  image_url: string;
  images?: string[];
  title: string;
  sale?: boolean;
  mark?: "standard" | "best_seller" | "new";
}

export function ProductDetailImage({
  image_url,
  images = [],
  title,
  sale,
  mark,
}: ProductDetailImageProps) {
  const allImages = [image_url, ...images].filter(Boolean);
  const restImages = allImages.slice(1);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (allImages.length === 0) {
    return (
      <div className="md:sticky md:top-20 lg:top-25 md:self-start">
        <div className="aspect-3/2 w-full rounded-[16px] bg-sand" />
      </div>
    );
  }

  return (
    <div className="md:sticky md:top-20 lg:top-25 md:self-start flex flex-col gap-2">
      {/* Main image */}
      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="relative aspect-3/2 w-full rounded-[16px] overflow-hidden bg-sand cursor-zoom-in"
      >
        <Image
          src={allImages[0]}
          alt={`${title} 1`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {(sale || (mark && mark !== "standard")) && (
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {sale && (
              <Badge variant="counter" size="sm">
                SALE
              </Badge>
            )}
            {mark === "best_seller" && (
              <Badge variant="counter" size="sm" className="bg-red-700!">
                BEST SELLER
              </Badge>
            )}
            {mark === "new" && (
              <Badge variant="counter" size="sm" className="bg-moss!">
                NEW
              </Badge>
            )}
          </div>
        )}
      </button>

      {/* Rest of images in gallery */}
      {restImages.length > 0 && (
        <Gallery
          images={restImages.map((src, i) => ({ src, alt: `${title} ${i + 2}` }))}
          onClick={(index) => setLightboxIndex(index + 1)}
        />
      )}

      {/* Shared lightbox for all images — mounted lazily on first open */}
      {lightboxIndex >= 0 && (
        <Lightbox
          open
          onClose={() => setLightboxIndex(-1)}
          slides={allImages.map((src, i) => ({ src, alt: `${title} ${i + 1}` }))}
          index={lightboxIndex}
        />
      )}
    </div>
  );
}

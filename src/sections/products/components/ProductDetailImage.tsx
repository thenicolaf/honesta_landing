"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, Thumbnail } from "@/shared/ui";

interface ProductDetailImageProps {
  image_url: string;
  images?: string[];
  title: string;
}

export function ProductDetailImage({
  image_url,
  images = [],
  title,
}: ProductDetailImageProps) {
  const allImages = [image_url, ...images].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentImage = allImages[selectedIndex] ?? image_url;

  return (
    <div className="md:sticky md:top-20 lg:top-25 md:self-start flex flex-col gap-3">
      {/* Main image */}
      <button
        type="button"
        onClick={() => currentImage && setPreviewOpen(true)}
        className="relative aspect-3/2 w-full rounded-[16px] overflow-hidden bg-sand cursor-zoom-in"
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`${title} ${selectedIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-sand" />
        )}
      </button>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {allImages.map((src, idx) => (
            <Thumbnail
              key={src}
              src={src}
              alt={`${title} ${idx + 1}`}
              selected={idx === selectedIndex}
              showLabel={false}
              onClick={() => setSelectedIndex(idx)}
            />
          ))}
        </div>
      )}

      <Lightbox
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        slides={allImages.map((src, i) => ({ src, alt: `${title} ${i + 1}` }))}
        index={selectedIndex}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, ImagePreview } from "@/shared/ui";

interface ProductDetailImageProps {
  image_url: string;
  title: string;
}

export function ProductDetailImage({
  image_url,
  title,
}: ProductDetailImageProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="md:sticky md:top-20 lg:top-25 md:self-start">
      <button
        type="button"
        onClick={() => image_url && setPreviewOpen(true)}
        className="relative aspect-3/2 w-full rounded-[16px] overflow-hidden bg-sand cursor-zoom-in"
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-sand" />
        )}
      </button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent size="full" className="p-0 overflow-hidden">
          <ImagePreview
            images={[image_url]}
            alt={title}
            className="rounded-2xl"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

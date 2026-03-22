"use client";

import { RowsPhotoAlbum, type Photo } from "react-photo-album";
import "react-photo-album/rows.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GalleryImage {
  src: string;
  alt?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  /** Target row height in px (default: 180) */
  rowHeight?: number;
  /** Max photos per row (default: 3) */
  maxPerRow?: number;
  /** Gap between images in px (default: 8) */
  spacing?: number;
  /** Called when an image is clicked */
  onClick?: (index: number) => void;
  className?: string;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function Gallery({
  images,
  rowHeight = 180,
  maxPerRow = 3,
  spacing = 8,
  onClick,
  className,
}: GalleryProps) {
  if (images.length === 0) return null;

  const photos: Photo[] = images.map((img) => ({
    src: img.src,
    alt: img.alt,
    width: 400,
    height: 300,
  }));

  return (
    <div className={className}>
      <RowsPhotoAlbum
        photos={photos}
        targetRowHeight={rowHeight}
        rowConstraints={{ maxPhotos: maxPerRow }}
        spacing={spacing}
        onClick={onClick ? ({ index }) => onClick(index) : undefined}
        render={{
          image: ({ src, alt, style }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src as string}
              alt={alt ?? ""}
              style={{ ...style, objectFit: "cover" }}
              className="rounded-xl bg-sand cursor-zoom-in"
            />
          ),
        }}
      />
    </div>
  );
}

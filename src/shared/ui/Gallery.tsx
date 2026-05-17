"use client";

import { Play } from "lucide-react";
import { RowsPhotoAlbum, type Photo } from "react-photo-album";
import "react-photo-album/rows.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GalleryImage {
  src: string;
  alt?: string;
  /** Renders a centered Play overlay on top of the thumbnail */
  isVideo?: boolean;
  /**
   * If set, the tile is rendered as a <video> element (showing the first
   * frame) instead of an <img>. Use for MP4 thumbnails so the user sees
   * actual video content, not a placeholder poster.
   */
  videoSrc?: string;
}

type GalleryPhoto = Photo & { isVideo?: boolean; videoSrc?: string };

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

  const photos: GalleryPhoto[] = images.map((img) => ({
    src: img.src,
    alt: img.alt,
    width: 400,
    height: 300,
    isVideo: img.isVideo,
    videoSrc: img.videoSrc,
  }));

  return (
    <div className={className}>
      <RowsPhotoAlbum<GalleryPhoto>
        photos={photos}
        targetRowHeight={rowHeight}
        rowConstraints={{ maxPhotos: maxPerRow, singleRowMaxHeight: rowHeight }}
        spacing={spacing}
        onClick={onClick ? ({ index }) => onClick(index) : undefined}
        render={{
          image: ({ src, alt, style, className }, { photo }) => {
            // react-photo-album's .react-photo-album--image class sets
            // width:100% + aspect-ratio:photo.width/photo.height + display:block,
            // which is what enforces equal-height tiles in a row. We must
            // pass `className` through to keep it — otherwise <video> falls
            // back to its natural aspect (often 16:9 for phone clips) and
            // renders a shorter tile than image siblings.
            const mergedClassName = `${className ?? ""} rounded-xl bg-sand cursor-zoom-in`;
            const mergedStyle = { ...style, objectFit: "cover" as const };
            return photo.videoSrc ? (
              <video
                src={photo.videoSrc}
                style={mergedStyle}
                className={mergedClassName}
                preload="metadata"
                muted
                playsInline
                aria-label={alt ?? ""}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src as string}
                alt={alt ?? ""}
                style={mergedStyle}
                className={mergedClassName}
              />
            );
          },
          extras: (_, { photo }) =>
            photo.isVideo ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-xl"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-earth/60 text-cream shadow-lg">
                  <Play size={20} className="ml-0.5" fill="currentColor" />
                </span>
              </div>
            ) : null,
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Badge } from "@/shared/ui";
import type { GalleryImage } from "@/shared/ui/Gallery";
import type { LightboxSlide } from "@/shared/ui/Lightbox";
import {
  extractYouTubeId,
  getVideoKind,
  getYouTubeThumbnail,
} from "@/shared/utils/videoUrl";

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
  video_url?: string | null;
  title: string;
  sale?: boolean;
  mark?: "standard" | "best_seller" | "new";
}

interface MediaEntry {
  slide: LightboxSlide;
  thumbnail: GalleryImage;
}

function buildVideoEntry(
  videoUrl: string,
  title: string,
): MediaEntry | null {
  const kind = getVideoKind(videoUrl);
  if (kind === "youtube") {
    const id = extractYouTubeId(videoUrl);
    if (!id) return null;
    const poster = getYouTubeThumbnail(id);
    return {
      slide: { type: "youtube", videoId: id, poster, alt: `${title} video` },
      thumbnail: { src: poster, alt: `${title} video`, isVideo: true },
    };
  }
  if (kind === "mp4") {
    return {
      slide: {
        type: "video",
        sources: [{ src: videoUrl, type: "video/mp4" }],
        // No `poster` — let the browser render the actual first frame so
        // the user sees video content, not a product image.
        alt: `${title} video`,
      },
      thumbnail: {
        // Empty src; videoSrc tells Gallery to render <video> for first frame.
        src: "",
        videoSrc: videoUrl,
        alt: `${title} video`,
        isVideo: true,
      },
    };
  }
  return null;
}

export function ProductDetailImage({
  image_url,
  images = [],
  video_url,
  title,
  sale,
  mark,
}: ProductDetailImageProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const allImages = [image_url, ...images].filter(Boolean);
  const videoEntry = video_url ? buildVideoEntry(video_url, title) : null;

  const slides: LightboxSlide[] = [
    ...allImages.map<LightboxSlide>((src, i) => ({
      src,
      alt: `${title} ${i + 1}`,
    })),
    ...(videoEntry ? [videoEntry.slide] : []),
  ];

  // Gallery shows everything *except* the main image (which is the big preview
  // above). For mp4 the main image already doubles as the poster, so it's not
  // re-rendered there.
  const restThumbnails: GalleryImage[] = [
    ...allImages.slice(1).map<GalleryImage>((src, i) => ({
      src,
      alt: `${title} ${i + 2}`,
    })),
    ...(videoEntry ? [videoEntry.thumbnail] : []),
  ];

  const videoSlideIndex = videoEntry ? slides.length - 1 : -1;

  const handleCloseLightbox = () => setLightboxIndex(-1);
  const handleGalleryClick = (index: number) => {
    const isVideoTile = videoEntry && index === restThumbnails.length - 1;
    setLightboxIndex(isVideoTile ? videoSlideIndex : index + 1);
  };

  if (allImages.length === 0 && !videoEntry) {
    return (
      <div className="md:sticky md:top-20 lg:top-25 md:self-start">
        <div className="aspect-3/2 w-full rounded-[16px] bg-sand" />
      </div>
    );
  }

  return (
    <div className="md:sticky md:top-20 lg:top-25 md:self-start flex flex-col gap-2">
      {/* Main image */}
      {allImages.length > 0 && (
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
      )}

      {/* Gallery: remaining images + optional video thumbnail */}
      {restThumbnails.length > 0 && (
        <Gallery images={restThumbnails} onClick={handleGalleryClick} />
      )}

      {/* Shared lightbox for all media — mounted lazily on first open */}
      {lightboxIndex >= 0 && (
        <Lightbox
          open
          onClose={handleCloseLightbox}
          slides={slides}
          index={lightboxIndex}
        />
      )}
    </div>
  );
}

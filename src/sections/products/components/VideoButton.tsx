"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import type { LightboxSlide } from "@/shared/ui/Lightbox";
import {
  extractYouTubeId,
  getVideoKind,
  getYouTubeThumbnail,
} from "@/shared/utils/videoUrl";

const Lightbox = dynamic(
  () => import("@/shared/ui/Lightbox").then((m) => m.Lightbox),
  { ssr: false },
);

interface VideoButtonProps {
  video_url: string;
  title: string;
}

function buildSlide(videoUrl: string, title: string): LightboxSlide | null {
  const kind = getVideoKind(videoUrl);
  if (kind === "youtube") {
    const id = extractYouTubeId(videoUrl);
    if (!id) return null;
    return {
      type: "youtube",
      videoId: id,
      poster: getYouTubeThumbnail(id),
      alt: `${title} video`,
    };
  }
  if (kind === "mp4") {
    return {
      type: "video",
      sources: [{ src: videoUrl, type: "video/mp4" }],
      // No poster — let the browser show actual first frame of the video.
      alt: `${title} video`,
    };
  }
  return null;
}

export function VideoButton({ video_url, title }: VideoButtonProps) {
  const [open, setOpen] = useState(false);

  const slide = buildSlide(video_url, title);
  if (!slide) return null;

  const slides = [slide];
  const handleClose = () => setOpen(false);
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <Tooltip side="top">
        <TooltipTrigger asChild>
          <Button
            as="button"
            type="button"
            variant="text"
            size="icon"
            onClick={handleOpen}
            className="rounded-full bg-earth/30 p-1.5! text-white-warm! backdrop-blur-sm hover:bg-earth/50 transition-all duration-300"
            aria-label="Play video"
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Watch video</TooltipContent>
      </Tooltip>

      {open && <Lightbox open onClose={handleClose} slides={slides} />}
    </>
  );
}

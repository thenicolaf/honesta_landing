"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Button,
  FormError,
  FormInput,
  FormLabel,
  FormTileRadio,
  FormTileRadioItem,
  FormUploadZone,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { getVideoKind } from "@/shared/utils/videoUrl";
import { SectionCard, SectionLabel, type SectionProps } from "./shared";

type VideoMode = "upload" | "youtube";

function resolveInitialMode(videoUrl: string | null | undefined): VideoMode {
  return getVideoKind(videoUrl) === "youtube" ? "youtube" : "upload";
}

export function VideoSection({ product, state }: SectionProps) {
  const currentVideoUrl = product?.video_url ?? null;
  const initialMode = resolveInitialMode(currentVideoUrl);
  const [mode, setMode] = useState<VideoMode>(initialMode);

  const initialUploadUrl =
    getVideoKind(currentVideoUrl) === "mp4" && currentVideoUrl
      ? currentVideoUrl
      : undefined;
  const initialYoutubeUrl =
    getVideoKind(currentVideoUrl) === "youtube" && currentVideoUrl
      ? currentVideoUrl
      : "";

  const errorMsg = state?.fieldErrors?.video_url;

  return (
    <SectionCard>
      <div className="flex items-center gap-1">
        <SectionLabel>Product video</SectionLabel>
        <Tooltip side="top">
          <TooltipTrigger asChild>
            <Button
              as="button"
              type="button"
              variant="text"
              size="icon"
              aria-label="Product video info"
              className="text-earth/40 hover:text-earth/70"
            >
              <Info size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="w-64 whitespace-normal text-left leading-snug">
            Optional review or recipe video. Upload an MP4 (up to 50&nbsp;MB) or
            paste a YouTube link. The video appears in the product gallery and
            in a Play button on the card.
          </TooltipContent>
        </Tooltip>
      </div>

      <div>
        <FormLabel>Source</FormLabel>
        <FormTileRadio
          name="video_mode"
          value={mode}
          onValueChange={(v) => setMode(v as VideoMode)}
          size="sm"
        >
          <FormTileRadioItem value="upload">Upload</FormTileRadioItem>
          <FormTileRadioItem value="youtube">YouTube URL</FormTileRadioItem>
        </FormTileRadio>
      </div>

      {mode === "upload" ? (
        <div>
          <FormLabel>Video file</FormLabel>
          <FormUploadZone
            name="video_file"
            accept="video/*"
            mimePrefix="video/"
            noun="a video"
            acceptLabel="MP4, WebM, MOV"
            maxSizeMb={80}
            multiple={false}
            bucket="product-videos"
            slug="product-video"
            initialUrl={initialUploadUrl}
            state={errorMsg ? "error" : "default"}
          />
        </div>
      ) : (
        <div>
          <FormLabel htmlFor="p-video-youtube">YouTube URL</FormLabel>
          <FormInput
            id="p-video-youtube"
            name="video_youtube_url"
            placeholder="https://www.youtube.com/watch?v=…"
            defaultValue={initialYoutubeUrl}
            state={errorMsg ? "error" : "default"}
          />
        </div>
      )}

      <FormError message={errorMsg} />
    </SectionCard>
  );
}

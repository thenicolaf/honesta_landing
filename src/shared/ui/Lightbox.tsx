"use client";

import { useMemo } from "react";
import YARLightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { SlotStyles, Slide as YARSlide } from "yet-another-react-lightbox";
import { getYouTubeEmbedUrl } from "@/shared/utils/videoUrl";

declare module "yet-another-react-lightbox" {
  interface SlideTypes {
    youtube: SlideYouTube;
  }
  interface SlideYouTube extends GenericSlide {
    type: "youtube";
    videoId: string;
    poster?: string;
    alt?: string;
  }
}

export interface LightboxImageSlide {
  type?: "image";
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface LightboxVideoSlide {
  type: "video";
  sources: { src: string; type: string }[];
  poster?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface LightboxYouTubeSlide {
  type: "youtube";
  videoId: string;
  poster?: string;
  alt?: string;
}

export type LightboxSlide =
  | LightboxImageSlide
  | LightboxVideoSlide
  | LightboxYouTubeSlide;

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  slides: LightboxSlide[];
  index?: number;
}

const brandStyles: SlotStyles = {
  root: {
    "--yarl__color_backdrop": "rgba(61, 43, 31, 0.85)",
    "--yarl__color_button": "#fffdf8",
    "--yarl__color_button_active": "#d4731a",
    "--yarl__thumbnails_thumbnail_border": "2px",
    "--yarl__thumbnails_thumbnail_border_color": "transparent",
    "--yarl__thumbnails_thumbnail_active_border_color": "#d4731a",
    "--yarl__thumbnails_thumbnail_border_radius": "8px",
    "--yarl__thumbnails_thumbnail_padding": "0",
    "--yarl__thumbnails_thumbnail_background": "transparent",
    "--yarl__thumbnails_thumbnail_focus_box_shadow": "none",
    "--yarl__counter_container_background": "transparent",
  },
};

const PLUGINS_WITH_THUMBS = [Zoom, Counter, Thumbnails, Video];
const PLUGINS_SINGLE = [Zoom, Video];
const ZOOM_SETTINGS = { maxZoomPixelRatio: 3 };
const ANIMATION_SETTINGS = { fade: 300 };
const VIDEO_SETTINGS = {
  controls: true,
  playsInline: true,
  preload: "metadata",
  autoPlay: true,
};
const CAROUSEL_FINITE = { finite: true };
const CAROUSEL_INFINITE = { finite: false };

const hideNav = () => null;

const renderYouTubeSlide = ({
  slide,
  offset,
}: {
  slide: YARSlide;
  offset: number;
}) => {
  if (slide.type !== "youtube") return undefined;
  const yt = slide as LightboxYouTubeSlide;
  // Only autoplay the active slide (offset === 0). Off-screen preloaded
  // slides get a plain embed so they don't all start playing at once.
  const isActive = offset === 0;
  const baseUrl = getYouTubeEmbedUrl(yt.videoId);
  const src = isActive ? `${baseUrl}&autoplay=1&mute=1` : baseUrl;
  return (
    <div
      style={{
        position: "relative",
        width: "min(90vw, calc(90vh * 16 / 9))",
        aspectRatio: "16 / 9",
        maxHeight: "90vh",
      }}
    >
      <iframe
        src={src}
        title={yt.alt ?? "YouTube video player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: 8,
        }}
      />
    </div>
  );
};

const renderRichThumbnail = ({
  slide,
  rect,
}: {
  slide: YARSlide;
  rect: { width: number; height: number };
}) => {
  // MP4 / uploaded video: render <video> so the browser shows the first frame.
  if (slide.type === "video") {
    const v = slide as LightboxVideoSlide;
    const src = v.sources[0]?.src;
    if (!src) return undefined;
    return (
      <video
        src={src}
        style={{
          width: rect.width,
          height: rect.height,
          objectFit: "cover",
          borderRadius: 8,
        }}
        preload="metadata"
        muted
        playsInline
        aria-label={v.alt ?? ""}
      />
    );
  }
  // YouTube: use the canonical YouTube thumbnail image.
  if (slide.type === "youtube") {
    const yt = slide as LightboxYouTubeSlide;
    if (!yt.poster) return undefined;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={yt.poster}
        alt={yt.alt ?? ""}
        style={{
          width: rect.width,
          height: rect.height,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
    );
  }
  return undefined;
};

const RENDER_WITH_NAV = {
  slide: renderYouTubeSlide,
  thumbnail: renderRichThumbnail,
};
const RENDER_NO_NAV = {
  slide: renderYouTubeSlide,
  thumbnail: renderRichThumbnail,
  buttonPrev: hideNav,
  buttonNext: hideNav,
};

export function Lightbox({ open, onClose, slides, index = 0 }: LightboxProps) {
  const hasManySlides = slides.length > 1;
  const plugins = hasManySlides ? PLUGINS_WITH_THUMBS : PLUGINS_SINGLE;
  const carousel = hasManySlides ? CAROUSEL_INFINITE : CAROUSEL_FINITE;
  const render = hasManySlides ? RENDER_WITH_NAV : RENDER_NO_NAV;

  // Stabilize slides array reference. YARLightbox's internal reducer resets
  // globalIndex (and re-keys the carousel slide) whenever the `slides` prop
  // reference changes; that re-key tears down the <video> element and resets
  // playback. We memo by the slide identity strings — same content ⇒ same
  // reference ⇒ no reducer reset ⇒ video survives.
  const slidesKey = slides.map(getSlideIdentity).join("\n");
  const stableSlides = useMemo(
    () => slides as YARSlide[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slidesKey],
  );

  return (
    <YARLightbox
      open={open}
      close={onClose}
      slides={stableSlides}
      index={index}
      plugins={plugins}
      styles={brandStyles}
      carousel={carousel}
      zoom={ZOOM_SETTINGS}
      animation={ANIMATION_SETTINGS}
      video={VIDEO_SETTINGS}
      render={render}
    />
  );
}

function getSlideIdentity(slide: LightboxSlide): string {
  if (slide.type === "video") return `video:${slide.sources[0]?.src ?? ""}`;
  if (slide.type === "youtube") return `youtube:${slide.videoId}`;
  return `image:${slide.src}`;
}

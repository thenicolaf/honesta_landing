"use client";

import YARLightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { SlotStyles } from "yet-another-react-lightbox";

export interface LightboxSlide {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

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

export function Lightbox({ open, onClose, slides, index = 0 }: LightboxProps) {
  const hasManySlides = slides.length > 1;
  const plugins = hasManySlides ? [Zoom, Counter, Thumbnails] : [Zoom];

  return (
    <YARLightbox
      open={open}
      close={onClose}
      slides={slides}
      index={index}
      plugins={plugins}
      styles={brandStyles}
      carousel={{ finite: !hasManySlides }}
      zoom={{ maxZoomPixelRatio: 3 }}
      animation={{ fade: 300 }}
      render={
        hasManySlides
          ? undefined
          : {
              buttonPrev: () => null,
              buttonNext: () => null,
            }
      }
    />
  );
}

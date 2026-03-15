"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { Button } from "./Button";
import { IconChevron } from "@/shared/icons";

interface ImagePreviewProps {
  images: string[];
  alt?: string;
  defaultIndex?: number;
  className?: string;
}

const SWIPE_THRESHOLD = 50;

export function ImagePreview({
  images,
  alt = "Preview",
  defaultIndex = 0,
  className,
}: ImagePreviewProps) {
  const [current, setCurrent] = useState(defaultIndex);
  const [direction, setDirection] = useState(0);
  const [touched, setTouched] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0 });
  const touchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  if (images.length === 0) return null;

  const isCarousel = images.length > 1;
  const safeIndex = Math.min(current, images.length - 1);

  const go = (next: number) => {
    setDirection(next > safeIndex ? 1 : -1);
    setCurrent(next);
  };

  const prev = () => go(safeIndex === 0 ? images.length - 1 : safeIndex - 1);
  const next = () => go(safeIndex === images.length - 1 ? 0 : safeIndex + 1);

  const showTouchControls = () => {
    setTouched(true);
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setTouched(false), 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;

    // Only swipe if horizontal movement is dominant
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else {
      showTouchControls();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Main image */}
      <div
        className="group/carousel relative overflow-hidden rounded-xl bg-sand/30 aspect-square touch-pan-y"
        data-touched={touched || undefined}
        onTouchStart={isCarousel ? handleTouchStart : undefined}
        onTouchEnd={isCarousel ? handleTouchEnd : undefined}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={safeIndex}
            src={images[safeIndex]}
            alt={`${alt} ${safeIndex + 1}`}
            className="w-full h-full object-contain absolute inset-0"
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            draggable={false}
          />
        </AnimatePresence>

        {isCarousel && (
          <>
            <Button
              as="button"
              type="button"
              onClick={prev}
              variant="text"
              color="default"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white-warm/80 backdrop-blur-sm rounded-full z-10 transition-opacity opacity-0 group-hover/carousel:opacity-100 [@media(hover:none)]:opacity-100 group-data-touched/carousel:opacity-100"
            >
              <IconChevron className="w-4 h-4 rotate-90" />
            </Button>
            <Button
              as="button"
              type="button"
              onClick={next}
              variant="text"
              color="default"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white-warm/80 backdrop-blur-sm rounded-full z-10 transition-opacity opacity-0 group-hover/carousel:opacity-100 [@media(hover:none)]:opacity-100 group-data-touched/carousel:opacity-100"
            >
              <IconChevron className="w-4 h-4 -rotate-90" />
            </Button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <Button
                  key={i}
                  as="button"
                  type="button"
                  onClick={() => go(i)}
                  variant="text"
                  color="default"
                  size="icon"
                  className={cn(
                    "rounded-full size-3",
                    i === safeIndex
                      ? "bg-orange"
                      : "bg-earth/20 hover:bg-earth/40",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

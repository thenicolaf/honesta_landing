"use client";

import { useState } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/shared/utils/cn";

/**
 * Trust-marks strip (No Added Sugar, 100% Natural, No Preservatives, Made in UAE)
 * shown as the first child of a public page's <main>.
 *
 * Positioned `fixed` under the navbar (mirroring Navbar.tsx) so shrinking it on
 * scroll never reflows page content — an aria-hidden spacer reserves the navbar
 * + expanded-strip height once, and the fixed strip animates in place. On scroll
 * the marks shrink to a compact size so the strip reads as an extension of the
 * header. Frosted translucent sand + bottom border keep it distinct from
 * same-coloured sections below.
 */
const MARKS = [
  { src: "/images/marks/mark-2.png", alt: "100% Natural", width: 432, height: 474 },
  { src: "/images/marks/mark-1.png", alt: "No Added Sugar", width: 501, height: 474 },
  { src: "/images/marks/mark-3.png", alt: "No Preservatives", width: 465, height: 454 },
  { src: "/images/marks/mark-4.png", alt: "Made in UAE", width: 432, height: 460 },
];

export function TrustMarks() {
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setCompact(y > 40));

  return (
    <>
      {/* Reserves navbar + expanded-strip height so the fixed strip below can
          shrink on scroll without ever reflowing page content. */}
      <div aria-hidden className="h-40 md:h-52 lg:h-60" />

      <div
        aria-label="Our quality promise"
        role="group"
        className="fixed inset-x-0 top-16 lg:top-20 z-40 noise overflow-hidden border-b border-parchment/50 bg-sand/85 backdrop-blur-md"
      >
        <div
          className={cn(
            "mx-auto max-w-7xl px-6 lg:px-10 transition-[padding] duration-300 ease-out",
            compact ? "py-2 md:py-3" : "py-4 md:py-6",
          )}
        >
          <ul className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12">
            {MARKS.map((m) => (
              <li key={m.alt} className="animate-about-stagger">
                <Image
                  src={m.src}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                  className={cn(
                    "object-contain transition-all duration-300 ease-out hover:scale-[1.06]",
                    compact
                      ? "h-10 w-10 md:h-14 md:w-14 lg:h-16 lg:w-16"
                      : "h-16 w-16 md:h-24 md:w-24 lg:h-28 lg:w-28",
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, Button, RichText } from "@/shared/ui";
import { IconBotanical, IconLeaf } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

const STORAGE_KEY = "honesta_popup_seen_versions";
const OPEN_DELAY_MS = 5000;

interface MarketingPopupDialogProps {
  id: string;
  version: number;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function readSeenMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeSeenMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function MarketingPopupDialog({
  id,
  version,
  title,
  body,
  image_url,
  cta_label,
  cta_url,
}: MarketingPopupDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const map = readSeenMap();
    const seen = map[id] ?? 0;
    if (seen >= version) return;
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [id, version]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      const map = readSeenMap();
      map[id] = version;
      writeSeenMap(map);
    }
  };

  const showCta = Boolean(cta_label && cta_url);
  const ctaIsExternal = cta_url ? isExternalUrl(cta_url) : false;
  const hasImage = Boolean(image_url);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="full"
        className="overflow-hidden p-0 rounded-3xl shadow-2xl shadow-earth/30"
      >
        <div
          className={cn(
            "relative grid grid-cols-1",
            hasImage && "md:grid-cols-[5fr_6fr]",
          )}
        >
          {hasImage && (
            <div className="relative aspect-4/5 md:aspect-auto md:min-h-115 bg-sand">
              <Image
                src={image_url!}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
                priority={false}
              />
              {/* Soft brand-colored vignette to blend the image into the content panel */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-cream/45 md:bg-linear-to-r md:from-transparent md:via-transparent md:to-cream/55 pointer-events-none" />
            </div>
          )}

          <div className="noise relative flex flex-col justify-center bg-cream px-8 py-10 md:px-12 md:py-14">
            {/* Subtle botanical decorations — corner accents */}
            <IconBotanical
              className="absolute -top-2 -right-2 w-24 h-24 text-orange/10 rotate-12 pointer-events-none"
              aria-hidden
            />
            <IconLeaf
              className="absolute -bottom-3 -left-3 w-16 h-16 text-moss/15 -rotate-12 pointer-events-none"
              aria-hidden
            />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex flex-col gap-5"
            >
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-orange/60" aria-hidden />
                <p className="font-body font-semibold uppercase tracking-[0.22em] text-2xs text-moss">
                  Especially for you
                </p>
              </div>

              <h2 className="font-display font-bold italic text-heading text-3xl md:text-4xl leading-[1.05] tracking-tight">
                {title}
              </h2>

              {body && (
                <div className="font-body font-light text-earth/85 text-sm md:text-base leading-relaxed">
                  <RichText html={body} />
                </div>
              )}

              {showCta && (
                <div className="pt-2">
                  <Button
                    href={cta_url!}
                    variant="primary"
                    size="lg"
                    endIcon={<ArrowRight size={16} className="ml-1" />}
                    className="w-full md:w-auto"
                    onClick={() => handleOpenChange(false)}
                    {...(ctaIsExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {cta_label}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

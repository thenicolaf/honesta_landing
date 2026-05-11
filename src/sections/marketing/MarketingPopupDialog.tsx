"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, Button, RichText } from "@/shared/ui";
import { IconBotanical, IconLeaf } from "@/shared/icons";

const STORAGE_KEY = "honesta_popup_seen_session";
const OPEN_DELAY_MS = 5000;

interface MarketingPopupDialogProps {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function readSeenSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeSeenSet(set: Set<string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function MarketingPopupDialog({
  id,
  title,
  body,
  image_url,
  cta_label,
  cta_url,
}: MarketingPopupDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readSeenSet().has(id)) return;
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [id]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      const set = readSeenSet();
      set.add(id);
      writeSeenSet(set);
    }
  };

  const showCta = Boolean(cta_label && cta_url);
  const ctaIsExternal = cta_url ? isExternalUrl(cta_url) : false;
  const hasImage = Boolean(image_url);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="xl"
        className="overflow-hidden p-0 rounded-3xl shadow-2xl shadow-earth/30"
      >
        <div className="relative flex flex-col">
          {hasImage && (
            <div className="relative w-full bg-cream aspect-3/2 sm:aspect-2/1 md:aspect-21/9">
              <Image
                src={image_url!}
                alt=""
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-contain object-center"
                quality={85}
                priority
              />
              {/* Soft bottom fade to blend the image into the content panel */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-cream pointer-events-none" />
            </div>
          )}

          <div className="noise relative overflow-hidden flex flex-col bg-cream px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
            {/* Subtle botanical decorations — corner accents inside the panel */}
            <IconBotanical
              className="absolute top-3 right-3 w-20 h-20 md:w-24 md:h-24 text-orange/15 rotate-12 pointer-events-none"
              aria-hidden
            />
            <IconLeaf
              className="absolute bottom-3 left-3 w-14 h-14 md:w-16 md:h-16 text-moss/20 -rotate-12 pointer-events-none"
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

"use client";

import Image from "next/image";
import { useScroll, useTransform, motion } from "motion/react";
import { Button } from "@/shared/ui";
import { IconInstagram } from "@/shared/icons/IconInstagram";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const { scrollY } = useScroll();

  // Parallax: image moves up slightly as user scrolls down (20% of scroll)
  const imageY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section id="hero" className="relative h-screen min-h-160 overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
        <Image
          src={"/images/hero.avif"}
          alt="Natural dried orange slices — Honesta"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      {/* Warm amber wash — gives the whole hero a dried-orange richness */}
      <div className="absolute inset-0 bg-orange/10" />
      {/* Gradient overlay: warm sand from left, fading to transparent right */}
      <div className="absolute inset-0 bg-linear-to-r from-sand/88 via-sand/55 to-transparent" />
      {/* Bottom fade for smooth transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-sand/55 to-transparent" />

      {/* Content */}
      <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-center">
        <motion.div
          className="max-w-xl pt-20"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
        >
          {/* Label */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-semibold uppercase text-[11px] tracking-[0.22em] text-bark mb-6"
          >
            100% Natural · Handcrafted · No additives
          </motion.p>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display font-bold italic text-earth leading-[1.1] mb-6"
            style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)" }}
          >
            Natural sweetness
            <br />
            invented by nature.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-light text-earth/75 text-lg leading-relaxed mb-10"
          >
            Honest. Simple. No additives.
            <br />
            Small Batch &amp; Handcrafted.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-4 flex-wrap"
          >
            <Button href="#products" size="lg">
              Explore Honest Sweets
            </Button>
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body font-semibold uppercase text-[11px] tracking-[0.14em] text-earth/60 hover:text-orange transition-colors duration-200"
            >
              <IconInstagram className="w-4 h-4" />
              Write us on Instagram
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="font-body font-light uppercase text-[9px] tracking-[0.2em] text-earth/40">
          Scroll
        </span>
        <motion.div
          className="w-px h-8 bg-earth/20"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}

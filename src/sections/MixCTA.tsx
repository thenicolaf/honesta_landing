"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/shared/ui";
import { SectionId } from "@/shared/consts/navLinks";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

interface MixCTAProps {
  hasActiveBoxes: boolean;
}

export function MixCTA({ hasActiveBoxes }: MixCTAProps) {
  return (
    <section
      id={SectionId.Mix}
      className="noise relative bg-earth overflow-hidden py-14 md:py-24"
    >
      <div className="absolute inset-0 bg-earth/80" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.14, delayChildren: 0.05 },
            },
          }}
          className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-16"
        >
          {/* Image */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-xs sm:max-w-sm lg:max-w-lg aspect-5/3 lg:aspect-3/2 rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 mb-6 lg:mb-0 shrink-0"
          >
            <Image
              src="/images/sections/mix.jpg"
              alt="Mix box with dried fruits"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 50vw"
            />
          </motion.div>

          {/* Text + CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-white-warm/60 mb-3 lg:mb-5"
            >
              Mix Constructor
            </motion.p>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display font-bold italic text-white-warm leading-tight mb-3 lg:mb-5"
              style={{ fontSize: "clamp(1.6rem, 5vw, 3.2rem)" }}
            >
              Build your perfect mix
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-body font-light text-white-warm/80 text-sm md:text-base lg:text-lg leading-relaxed mb-6 lg:mb-8 max-w-lg"
            >
              Choose a box, fill each cell with your favourite dried fruits and
              fruit leathers — create a unique combination tailored to your
              taste.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {hasActiveBoxes ? (
                <Button href="/mix" variant="primary" size="md">
                  Build Your Mix
                </Button>
              ) : (
                <div className="inline-flex items-center gap-3 px-5 py-2.5 lg:px-6 lg:py-3 rounded-full border border-white-warm/20 bg-white-warm/5">
                  <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                  <span className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-white-warm/80">
                    Mixes coming soon
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

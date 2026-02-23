"use client";

import { motion } from "motion/react";
import { IconInstagram } from "@/shared/icons";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function InstagramCTA() {
  return (
    <section
      id="contact"
      className="noise relative bg-orange overflow-hidden py-24 md:py-32"
    >
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.14, delayChildren: 0.05 },
            },
          }}
        >
          {/* Label */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-white/70 mb-6"
          >
            We&apos;re here to help
          </motion.p>

          {/* H2 */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display font-bold italic text-white-warm leading-tight mb-5"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            Hard to choose?
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-light text-white/85 text-base md:text-lg leading-relaxed mb-3 max-w-xl mx-auto"
          >
            We&apos;ll help you find your perfect flavour. No bots&nbsp;— just
            us.
          </motion.p>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-light text-white/65 text-sm md:text-base leading-relaxed mb-12 max-w-md mx-auto"
          >
            Tell us if you have kids, allergies, or what you&apos;re looking
            for&nbsp;— we&apos;ll suggest exactly what fits.
          </motion.p>

          {/* CTA button + micro-text */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white-warm text-orange border-2 border-white-warm rounded-full font-body font-semibold uppercase tracking-[0.12em] text-sm px-10 py-5 hover:bg-transparent hover:text-white-warm hover:border-white-warm transition-all duration-300"
            >
              <IconInstagram className="w-5 h-5 shrink-0" />
              Write us on Instagram
            </a>

            <p className="font-body font-light text-2xs text-white/60 tracking-wide">
              No bots. No auto-replies. A real person will answer you.
            </p>

            <p className="font-body font-light text-2xs text-white/55 tracking-[0.16em] uppercase mt-1">
              We reply to every message. Usually within an hour.
            </p>

            {/* Soft Instagram handle link */}
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-light text-2xs text-white/45 hover:text-white/75 transition-colors duration-200 tracking-widest uppercase mt-2"
            >
              instagram.com/{process.env.NEXT_PUBLIC_INSTAGRAM_BRAND}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "motion/react";

const manifestLines = [
  "No unnecessary additives.",
  "No misleading promises.",
  "Nothing hidden.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function PhilosophyBlock() {
  return (
    <section id="story" className="noise relative bg-sand overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] min-h-150">
          {/* ── Left: text ─────────────────────────────── */}
          <motion.div
            className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left py-20 lg:py-28 lg:pr-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.13, delayChildren: 0.05 },
              },
            }}
          >
            {/* Label */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-orange mb-6"
            >
              Our Philosophy
            </motion.p>

            {/* H2 */}
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display font-bold italic text-heading leading-tight mb-10"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
            >
              Honesty Before Compromise
            </motion.h2>

            {/* Intro */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-body font-light text-earth/70 text-base leading-relaxed mb-8 max-w-lg"
            >
              We believe good food should be easy to understand. That is why we
              choose real ingredients, clear recipes and careful production.
            </motion.p>

            {/* Manifesto lines */}
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col w-full max-w-sm mb-10"
            >
              {manifestLines.map((line) => {
                const [lead, ...rest] = line.split(" ");
                return (
                  <li
                    key={line}
                    className="flex items-baseline gap-3 border-b border-earth/10 py-3 first:pt-0 last:border-0"
                  >
                    <span
                      aria-hidden
                      className="h-px w-5 shrink-0 translate-y-[-0.35em] bg-orange/50"
                    />
                    <span className="font-body text-earth/75 text-base leading-relaxed">
                      <span className="font-semibold uppercase tracking-wide text-orange text-sm">
                        {lead}
                      </span>{" "}
                      <span className="italic">{rest.join(" ")}</span>
                    </span>
                  </li>
                );
              })}
            </motion.ul>

            {/* Closing line */}
            <motion.blockquote
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:border-l-2 lg:border-orange lg:pl-5"
            >
              <p
                className="font-display italic text-earth/80 leading-snug"
                style={{ fontSize: "clamp(1.05rem, 2vw, 1.3rem)" }}
              >
                Just honest food, made with care in the UAE.
              </p>
            </motion.blockquote>
          </motion.div>

          {/* ── Right: photo placeholder ─────────────────── */}
          <motion.div
            className="hidden lg:flex items-stretch"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative w-full">
              <Image
                src="/images/sections/Our Philosophy.webp"
                fill
                className="object-cover object-center"
                alt="Hands holding fresh fruit — Honesta"
              />
              {/* Left edge blend */}
              <div className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-sand to-transparent" />
              {/* Right edge blend */}
              <div className="absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-sand to-transparent" />
              {/* Subtle top/bottom vignette */}
              <div className="absolute inset-0 bg-linear-to-b from-sand/40 via-transparent to-sand/40" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

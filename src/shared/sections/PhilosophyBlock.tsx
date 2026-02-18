"use client";

import { motion } from "motion/react";
import { IconBotanical } from "@/shared/icons";

const manifestLines = [
  { prefix: "We don't add", emphasis: "flavors", suffix: "to mask reality." },
  {
    prefix: "We don't add",
    emphasis: "sugar",
    suffix: "to make up for poor ingredients.",
  },
  {
    prefix: "We don't add",
    emphasis: "colors",
    suffix: "to make things look good in photos.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function PhilosophyBlock() {
  return (
    <section id="story" className="noise relative bg-earth overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] min-h-150">
          {/* ── Left: text ─────────────────────────────── */}
          <motion.div
            className="flex flex-col justify-center py-20 lg:py-28 lg:pr-16"
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
              className="font-body font-semibold uppercase tracking-[0.18em] text-[11px] text-orange-light mb-6"
            >
              Our Philosophy
            </motion.p>

            {/* H2 */}
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display font-bold italic text-white-warm leading-tight mb-10"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
            >
              Sweetness Before Marketing
            </motion.h2>

            {/* Manifesto lines */}
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-3.5 mb-8"
            >
              {manifestLines.map(({ prefix, emphasis, suffix }) => (
                <li
                  key={emphasis}
                  className="font-body font-light text-sand/65 text-base leading-relaxed"
                >
                  {prefix}{" "}
                  <span className="font-medium text-sand/85 italic">
                    {emphasis}
                  </span>{" "}
                  {suffix}
                </li>
              ))}
            </motion.ul>

            {/* "What we DO add" */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-10 space-y-1"
            >
              <p className="font-body font-light text-sand/65 text-base leading-relaxed">
                What we{" "}
                <span className="font-semibold text-orange-light">DO</span> add
                — is{" "}
                <span className="font-semibold text-orange-light italic">
                  time
                </span>
                .
              </p>
              <p className="font-body font-light text-sand/65 text-base leading-relaxed">
                Each batch is made slowly, by hand, with care.
              </p>
              <p className="font-body font-semibold text-sand/90 text-base pt-1">
                That&apos;s the whole recipe.
              </p>
            </motion.div>

            {/* Pull-quote */}
            <motion.blockquote
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="border-l-2 border-orange pl-5"
            >
              <p
                className="font-display italic text-white-warm/85 leading-snug"
                style={{ fontSize: "clamp(1.05rem, 2vw, 1.3rem)" }}
              >
                &ldquo;If it grows on a tree, it belongs in the bag.
                <br />
                If it doesn&apos;t&nbsp;— it doesn&apos;t.&rdquo;
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
            {/* TODO: replace inner content with <Image src="/images/philosophy.jpg" fill className="object-cover" alt="Hands holding fresh fruit — Honesta"/> */}
            <div className="relative w-full bg-bark/20 flex items-center justify-center">
              <IconBotanical className="w-40 text-sand opacity-10" />
              <p className="absolute bottom-6 left-0 right-0 text-center font-body font-light text-[10px] uppercase tracking-[0.15em] text-sand/20">
                Photo placeholder
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

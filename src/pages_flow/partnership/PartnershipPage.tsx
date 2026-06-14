"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PartnershipForm } from "@/sections/partnership/PartnershipForm";
import { PartnershipInstagramCard } from "@/sections/partnership/PartnershipInstagramCard";
import { fadeUp } from "@/sections/partnership/consts";

const BENEFITS = [
  "Honest ingredients, no compromises",
  "Flexible volumes for any size",
  "Personal service end to end",
];

const BUSINESS_CHIPS = [
  "Restaurants",
  "Coffee shops",
  "Gyms",
  "Spas",
  "Hotels",
  "Event catering",
];

export function PartnershipPage() {
  return (
    <section className="noise relative bg-linear-to-b from-cream to-sand">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pt-28 lg:pt-36 pb-20 lg:pb-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.05 },
            },
          }}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-10 lg:gap-16 items-start"
        >
          {/* ── Left column: pitch + contact ─────────────── */}
          <div className="flex flex-col gap-7">
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-orange"
            >
              Wholesale &amp; Partnerships
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display font-bold italic text-heading leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
            >
              Bring Honesta to your business
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-body font-light text-earth/70 text-base md:text-lg leading-relaxed max-w-xl"
            >
              Restaurants, coffee shops, gyms, spas, hotels, and event
              catering — we supply businesses of any size with honest,
              small-batch products your guests will trust.
            </motion.p>

            {/* Benefits */}
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-3"
            >
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 font-body font-light text-earth/80 text-base"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange/12 border border-orange/25 shrink-0">
                    <Check className="w-3 h-3 text-orange" strokeWidth={2.5} />
                  </span>
                  {benefit}
                </li>
              ))}
            </motion.ul>

            {/* Business-type chips */}
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-wrap gap-2"
            >
              {BUSINESS_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="font-body font-light text-2xs uppercase tracking-[0.1em] text-earth/60 bg-white-warm/70 border border-earth/12 rounded-full px-3 py-1.5"
                >
                  {chip}
                </li>
              ))}
            </motion.ul>

            {/* Instagram card */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-1"
            >
              <PartnershipInstagramCard />
            </motion.div>
          </div>

          {/* ── Right column: form ───────────────────────── */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:sticky lg:top-28"
          >
            <div className="bg-white-warm rounded-2xl p-5 sm:p-8 border border-parchment shadow-[0_8px_40px_rgba(61,43,31,0.08)]">
              <p className="font-body font-semibold text-earth text-base mb-5">
                Send a partnership request
              </p>
              <PartnershipForm />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

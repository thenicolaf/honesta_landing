"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/shared/ui";
import { IconInstagram } from "@/shared/icons";
import { PartnershipForm } from "./PartnershipForm";
import { fadeUp } from "./consts";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PartnershipInstagramCard() {
  return (
    <div className="bg-white-warm/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 sm:p-8 flex flex-col gap-5">
      <div>
        <p className="font-body font-semibold text-white text-base mb-1">
          Message us directly
        </p>
        <p className="font-body font-light text-white/70 text-sm leading-relaxed">
          Quick questions, samples, or pricing — reach us on Instagram.
        </p>
      </div>

      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
        size="lg"
        className="w-full justify-center hover:bg-transparent hover:text-white-warm hover:border-white-warm"
      >
        <IconInstagram className="w-5 h-5 shrink-0" />
        Write us on Instagram
      </Button>

      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        size="lg"
        className="border-transparent text-white/45 hover:text-white/75 hover:border-transparent font-light -mt-2 w-full justify-center"
      >
        instagram.com/{process.env.NEXT_PUBLIC_INSTAGRAM_BRAND}
      </Button>
    </div>
  );
}

function PartnershipFormCard() {
  return (
    <div className="bg-white-warm rounded-2xl p-5 sm:p-8">
      <p className="font-body font-semibold text-earth text-base mb-5">
        Send a partnership request
      </p>
      <PartnershipForm />
    </div>
  );
}

// ─── PartnershipCTA ───────────────────────────────────────────────────────────

export function PartnershipCTA() {
  return (
    <section
      id="contact"
      className="noise relative bg-orange overflow-hidden py-24 md:py-32"
    >
      {/* Background photo */}
      <Image
        src="/images/sections/Contact.webp"
        fill
        className="object-cover scale-105 blur-sm"
        alt=""
        aria-hidden="true"
      />
      {/* Orange tint overlay */}
      <div className="absolute inset-0 bg-orange/60" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
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
            className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-white/70 mb-6 text-center"
          >
            Wholesale &amp; Partnerships
          </motion.p>

          {/* H2 */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display font-bold italic text-white-warm leading-tight mb-5 text-center"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3.8rem)" }}
          >
            Bring Honesta to your business
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-light text-white/85 text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-xl mx-auto text-center"
          >
            Restaurants, cafés, health stores, boutique hotels — we supply
            businesses of any size. Honest ingredients. Flexible volumes.
            Personal service.
          </motion.p>

          {/* Two-channel contact block */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-6 items-start"
          >
            <PartnershipInstagramCard />
            <PartnershipFormCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import {
  IconLeaf,
  IconHands,
  IconCleanLabel,
  IconNoSugar,
  IconBurjKhalifa,
} from "@/shared/icons";

const badges = [
  {
    Icon: IconBurjKhalifa,
    label: "Made in UAE",
    description: "Crafted in Dubai",
  },
  {
    Icon: IconLeaf,
    label: "100% Fruit",
    description: "Nothing else added",
  },
  {
    Icon: IconHands,
    label: "Small Batch",
    description: "Made by hand",
  },
  {
    Icon: IconCleanLabel,
    label: "Clean Label",
    description: "What you see = all",
  },
  {
    Icon: IconNoSugar,
    label: "No Sugar Added",
    description: "Natural sweetness only",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function TrustBadges() {
  return (
    <section className="noise relative bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          className="flex flex-wrap justify-center gap-10 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {badges.map(({ Icon, label, description }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 text-center w-36 md:w-40"
            >
              <Icon className="w-12 h-12 text-moss" />

              <div className="w-8 h-px bg-parchment" />

              <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth">
                {label}
              </p>

              <p className="font-body font-light text-sm text-earth/60 leading-snug">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

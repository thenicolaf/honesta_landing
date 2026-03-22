"use client";

import Image from "next/image";
import { useScroll, useTransform, motion } from "motion/react";
import { Button } from "@/shared/ui";
import { IconInstagram } from "@/shared/icons";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const { scrollY } = useScroll();

  // Parallax: image moves up slightly as user scrolls down (20% of scroll)
  const imageY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section
      id="hero"
      className="relative h-screen min-h-160 overflow-hidden bg-cream"
    >
      {/* Left hero image */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/4 max-xl:w-1/3 max-md:w-[40%]"
        style={{ y: imageY, aspectRatio: "759 / 1536" }}
      >
        <Image
          src="/honesta_left_hero.png"
          alt=""
          fill
          priority
          className="object-cover object-right"
          sizes="(max-width: 640px) 28vw, (max-width: 1024px) 25vw, 30vw"
        />
      </motion.div>

      {/* Right hero image */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/4 max-xl:w-1/3 max-md:w-[40%]"
        style={{ y: imageY, aspectRatio: "708 / 1536" }}
      >
        <Image
          src="/honesta_right_hero.png"
          alt=""
          fill
          priority
          className="object-cover object-left"
          sizes="(max-width: 640px) 28vw, (max-width: 1024px) 25vw, 30vw"
        />
      </motion.div>

      {/* Soft overlay — warm fade from center */}
      <div className="absolute inset-0 bg-radial-[ellipse_60%_80%_at_center] from-sand/70 via-sand/30 to-transparent max-md:from-sand/85 max-md:via-sand/50" />

      {/* Content */}
      <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-center">
        <motion.div
          className="max-w-lg pt-20 text-center relative"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.18, delayChildren: 0.1 },
            },
          }}
        >
          {/* Logo */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/honesta_logo.svg"
              alt="Honesta logo"
              width={256}
              height={256}
              className="size-52 sm:size-64 mx-auto"
            />
          </motion.div>

          {/* Brand name */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display font-bold text-heading leading-none mt-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            HONESTA
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-semibold uppercase tracking-[0.2em] text-heading text-sm sm:text-base mt-6 mb-2"
          >
            Natural. Healthy. Family.
          </motion.p>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display italic text-earth/60 text-lg sm:text-xl mb-10"
          >
            Embracing a healthy life together
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <Button href="#products" size="lg">
              Explore Honest Sweets
            </Button>
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body font-semibold uppercase text-2xs tracking-[0.14em] text-earth/60 hover:text-orange transition-colors duration-200"
            >
              <IconInstagram className="w-4 h-4" />
              Write us on Instagram
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

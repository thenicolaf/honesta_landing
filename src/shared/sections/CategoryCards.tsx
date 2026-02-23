"use client";

import { motion } from "motion/react";
import { Badge } from "@/shared/ui";
import {
  IconLeaf,
  IconLightning,
  IconGift,
  IconFruitLeather,
} from "@/shared/icons";
import { Category } from "@/shared/types";
import { useCategoryFilter } from "@/shared/providers";

const categories = [
  {
    audience: "For Every Occasion",
    Icon: IconGift,
    name: Category.MixAndGift,
    tagline: "Curated to impress.",
    description:
      "A thoughtful selection of our finest snacks. Perfect for gifting — or keeping all to yourself.",
    products: [
      "Gift Set Classic",
      "Gift Set Premium",
      "Seasonal Mix",
      "Custom Box",
    ],
    placeholderBg: "bg-bark/10",
    badge: "natural" as const,
    href: "#products",
  },
  {
    audience: "Pure & Simple",
    Icon: IconLeaf,
    name: Category.DriedFruits,
    tagline: "Sun-dried. Nothing else.",
    description:
      "Just fruit, slowly dried to perfection. No added sugar, no sulfites — pure concentrated flavour.",
    products: [
      "Dried Persimmon",
      "Dried Orange",
      "Dried Pineapple",
      "Dried Mango",
    ],
    placeholderBg: "bg-orange/10",
    badge: "natural" as const,
    href: "#products",
  },
  {
    audience: "For Snacking On the Go",
    Icon: IconFruitLeather,
    name: Category.FruitLeather,
    tagline: "Smooth, chewy, addictive.",
    description:
      "Real fruit pressed into a thin, satisfying sheet. A snack that needs no explanation.",
    products: [
      "Apple Fruit Leather",
      "Apple & Banana Leather",
      "Apple & Pineapple Leather",
    ],
    placeholderBg: "bg-moss/10",
    badge: "natural" as const,
    href: "#products",
  },
  {
    audience: "For Energy & Focus",
    Icon: IconLightning,
    name: Category.MixSeeds,
    tagline: "Small. Dense. Powerful.",
    description:
      "A handpicked blend of seeds and dried fruit — the cleanest fuel you can carry.",
    products: ["Classic Seed Mix", "Berry & Seed Mix", "Nut & Seed Blend"],
    placeholderBg: "bg-earth/10",
    badge: "natural" as const,
    href: "#products",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function CategoryCards() {
  const { setActiveCategory } = useCategoryFilter();

  return (
    <section id="categories" className="bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-4">
            Collections
          </p>
          <h2
            className="font-display font-semibold text-heading leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Find your perfect snack
          </h2>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {categories.map(
            ({
              audience,
              Icon,
              name,
              tagline,
              description,
              products,
              placeholderBg,
              badge,
              href,
            }) => (
              <motion.a
                key={name}
                href={href}
                onClick={() => setActiveCategory(name)}
                variants={cardVariants}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="group flex flex-col rounded-[16px] overflow-hidden bg-white-warm hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image placeholder */}
                <div
                  className={`relative aspect-4/3 ${placeholderBg} flex items-center justify-center`}
                >
                  <Icon className="w-16 h-16 text-earth/20" />
                  {/* TODO: replace with <Image src="..." fill ... /> */}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 gap-4">
                  {/* Audience label + badge */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/65">
                      {audience}
                    </p>
                    <Badge variant={badge} className="shrink-0">
                      Natural
                    </Badge>
                  </div>

                  {/* Name + tagline */}
                  <div>
                    <h3
                      className="font-display font-semibold text-heading leading-tight mb-1"
                      style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
                    >
                      {name}
                    </h3>
                    <p className="font-body font-light text-sm text-earth/70 italic">
                      {tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="font-body font-light text-sm text-earth/70 leading-relaxed">
                    {description}
                  </p>

                  {/* Product list */}
                  <ul className="flex flex-wrap gap-x-3 gap-y-1">
                    {products.map((p) => (
                      <li
                        key={p}
                        className="font-body font-light text-2xs text-earth/65 leading-tight before:content-['·'] before:mr-1.5 first:before:content-none"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-2 flex items-center gap-2 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-orange group-hover:text-orange-light transition-colors duration-200">
                    Explore
                    <span
                      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </div>
              </motion.a>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Badge } from "@/shared/ui";
import { IconLeaf, IconLightning, IconGift } from "@/shared/icons";

const categories = [
  {
    audience: "For Moms & Kids",
    Icon: IconLeaf,
    name: "Kids Collection",
    tagline: "No chemistry. Just fruit.",
    description:
      "Kids deserve real food. No dye, no preservatives — just pure fruit rolled into something delicious.",
    products: ["Apple Pastila", "Banana Pastila", "Apple+Banana", "Apple+Date"],
    placeholderBg: "bg-orange/10",
    badge: "natural" as const,
    href: "#products",
  },
  {
    audience: "For Sport & Office",
    Icon: IconLightning,
    name: "Clean Energy",
    tagline: "Fuel without guilt.",
    description:
      "Sport. Office. On the go. Real fuel that fits in your pocket.",
    products: ["Dried Orange", "Dried Banana", "Dried Date", "Apple & Pear"],
    placeholderBg: "bg-moss/10",
    badge: "natural" as const,
    href: "#products",
  },
  {
    audience: "For Gifts & Desserts",
    Icon: IconGift,
    name: "Gourmet Selection",
    tagline: "Chocolate. Nuts. Wow.",
    description: "A perfect gift. Or a treat you don't have to justify.",
    products: [
      "Orange in Dark Choc",
      "Orange in Milk Choc",
      "VIP Orange+Cedar",
      "Banana with Coconut",
    ],
    placeholderBg: "bg-bark/10",
    badge: "warm" as const,
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
  return (
    <section id="categories" className="bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-[11px] text-moss mb-4">
            Collections
          </p>
          <h2
            className="font-display font-semibold text-earth leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Find your perfect snack
          </h2>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
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
                    <p className="font-body font-semibold uppercase tracking-[0.14em] text-[10px] text-earth/50">
                      {audience}
                    </p>
                    <Badge variant={badge} className="shrink-0">
                      Natural
                    </Badge>
                  </div>

                  {/* Name + tagline */}
                  <div>
                    <h3
                      className="font-display font-semibold text-earth leading-tight mb-1"
                      style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
                    >
                      {name}
                    </h3>
                    <p className="font-body font-light text-sm text-earth/55 italic">
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
                        className="font-body font-light text-[11px] text-earth/45 leading-tight before:content-['·'] before:mr-1.5 first:before:content-none"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-2 flex items-center gap-2 font-body font-semibold uppercase tracking-[0.12em] text-[11px] text-orange group-hover:text-orange-light transition-colors duration-200">
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

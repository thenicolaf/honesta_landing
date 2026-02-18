"use client";

import { motion } from "motion/react";
import { Badge } from "@/shared/ui";

const products = [
  {
    name: "Apple Pastila",
    category: "Kids Collection",
    badge: "natural" as const,
    tags: ["100% Fruit", "No Sugar Added", "Kids Friendly"],
    description:
      "Pure apple, slowly dried and rolled by hand. Nothing else — no dye, no preservatives, no guilt.",
    placeholderBg: "bg-orange/8",
  },
  {
    name: "Dried Orange Slices",
    category: "Clean Energy",
    badge: "natural" as const,
    tags: ["100% Fruit", "No Sugar Added"],
    description:
      "Whole orange rings, air-dried to perfection. A zesty, pocket-sized energy hit — clean and simple.",
    placeholderBg: "bg-orange/15",
  },
  {
    name: "Orange in Dark Chocolate",
    category: "Gourmet Selection",
    badge: "warm" as const,
    tags: ["100% Fruit", "Dark Chocolate", "Gift-worthy"],
    description:
      "Sun-dried orange, dipped in rich dark chocolate. An indulgence you don't have to justify.",
    placeholderBg: "bg-bark/12",
  },
  {
    name: "Banana Pastila",
    category: "Kids Collection",
    badge: "natural" as const,
    tags: ["100% Fruit", "No Sugar Added", "Kids Friendly"],
    description:
      "Ripe bananas, dried slowly until chewy and sweet. A lunchbox hero — and parents approve.",
    placeholderBg: "bg-sand",
  },
  {
    name: "Dried Banana",
    category: "Clean Energy",
    badge: "natural" as const,
    tags: ["100% Fruit", "No Sugar Added"],
    description:
      "Dense, naturally sweet banana chips. Fuel for sport, office, or anywhere in between.",
    placeholderBg: "bg-orange/10",
  },
  {
    name: "Orange in Milk Chocolate",
    category: "Gourmet Selection",
    badge: "warm" as const,
    tags: ["100% Fruit", "Milk Chocolate", "Gift-worthy"],
    description:
      "The softer side of gourmet — dried orange wrapped in silky milk chocolate. A crowd-pleaser.",
    placeholderBg: "bg-bark/8",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function ProductGrid() {
  return (
    <section id="products" className="bg-white-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body font-semibold uppercase tracking-[0.18em] text-[11px] text-moss mb-4">
            What&apos;s inside the bag
          </p>
          <h2
            className="font-display font-bold italic text-earth leading-tight mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            6 ingredients or less.
          </h2>
          <p className="font-body font-light text-earth/55 text-lg">Always.</p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {products.map(
            ({ name, category, badge, tags, description, placeholderBg }) => (
              <motion.div
                key={name}
                variants={cardVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group rounded-[16px] overflow-hidden bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300"
              >
                {/* Image area */}
                <div className="relative aspect-square overflow-hidden">
                  {/* Placeholder — swap with <Image fill .../> when photos are ready */}
                  <div
                    className={`w-full h-full ${placeholderBg} transition-transform duration-500 group-hover:scale-105`}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-earth/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8">
                    <p className="font-body font-light text-sm text-white-warm text-center leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                  {/* Category */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body font-semibold uppercase tracking-[0.13em] text-[10px] text-earth/40">
                      {category}
                    </p>
                    <Badge variant={badge}>
                      {badge === "warm" ? "Gourmet" : "Natural"}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3
                    className="font-display font-semibold text-earth leading-tight"
                    style={{ fontSize: "clamp(1.15rem, 2vw, 1.4rem)" }}
                  >
                    {name}
                  </h3>

                  {/* Tags */}
                  <ul className="flex flex-wrap gap-x-3 gap-y-1">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="flex items-center gap-1 font-body font-light text-[11px] text-moss"
                      >
                        <span className="w-1 h-1 rounded-full bg-moss inline-block shrink-0" />
                        {tag}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-[11px] text-earth/40 hover:text-orange transition-colors duration-200 w-fit"
                  >
                    <span aria-hidden="true">▸</span>
                    Ask in Instagram
                  </a>
                </div>
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

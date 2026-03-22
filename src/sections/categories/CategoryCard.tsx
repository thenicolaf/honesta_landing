"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Badge } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { useFilterBar } from "@/providers/FilterProvider";
import type { CategoryCard as CategoryCardData } from "./types";
import { CATEGORY_UI_MAP, cardVariants } from "./consts";

export function CategoryCard({
  audience,
  slug,
  name,
  tagline,
  description,
  image_url,
  badge,
}: CategoryCardData) {
  const categoryFilter = useFilterBar("category");

  const { Icon, placeholderBg } = CATEGORY_UI_MAP[slug] ?? {
    Icon: IconLeaf,
    placeholderBg: "bg-earth/10",
  };

  return (
    <motion.button
      type="button"
      onClick={() => {
        categoryFilter.onValueChange(slug);
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }}
      variants={cardVariants}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="group flex flex-col rounded-[16px] overflow-hidden bg-white-warm hover:shadow-lg transition-shadow duration-300 text-left cursor-pointer"
    >
        {/* Image / placeholder */}
        <div
          className={`relative w-full aspect-4/3 ${image_url ? "" : placeholderBg} flex items-center justify-center`}
        >
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <Icon className="w-16 h-16 text-earth/20" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 gap-4">
          {/* Audience label + badge */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/65">
              {audience}
            </p>
            {badge && (
              <Badge variant="natural" className="shrink-0">
                {badge}
              </Badge>
            )}
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
    </motion.button>
  );
}

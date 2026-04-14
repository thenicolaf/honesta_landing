import Image from "next/image";
import { Badge } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { HashLink } from "../navbar";
import type { CategoryCard as CategoryCardData } from "./types";
import { CATEGORY_UI_MAP } from "./consts";

export function CategoryCardRow({
  slug,
  name,
  tagline,
  description,
  audience,
  image_url,
  badge,
  href,
}: CategoryCardData) {
  const { Icon, placeholderBg } = CATEGORY_UI_MAP[slug] ?? {
    Icon: IconLeaf,
    placeholderBg: "bg-earth/10",
  };

  return (
    <HashLink
      href={href}
      className="group relative flow-root h-full rounded-[16px] bg-white-warm hover:shadow-lg transition-shadow duration-300 text-left cursor-pointer p-3 sm:p-4"
    >
      {/* Floated image */}
      <div
        className={`relative float-left mr-3 mb-3 sm:mr-4 sm:mb-4 md:mr-5 w-32 sm:w-40 md:w-48 lg:w-52 xl:w-56 aspect-4/3 rounded-xl overflow-hidden ${image_url ? "" : placeholderBg} flex items-center justify-center`}
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, (max-width: 1280px) 208px, 224px"
          />
        ) : (
          <Icon className="w-12 h-12 text-earth/20" />
        )}
      </div>

      {/* Audience + name cluster — reserve right space for CTA only on very wide screens (2xl+) where Explore is absolute. Below 2xl Explore sits inline at the bottom, so no right padding needed. */}
      <div className="flex flex-col items-start gap-1.5 sm:gap-2 2xl:pr-28">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/65">
          {audience}
        </p>
        <h3
          className="font-display font-semibold text-heading leading-tight"
          style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
        >
          {name}
        </h3>
      </div>

      {/* Badge — natural width, wraps inside if parent constrains it */}
      {badge && (
        <div className="mt-2 md:mt-2.5 -translate-x-2">
          <Badge variant="natural">{badge}</Badge>
        </div>
      )}

      <p className="font-body font-light text-sm text-earth/70 italic mt-2.5 sm:mt-3 md:mt-4 mb-2 sm:mb-3 md:mb-4">
        {tagline}
      </p>

      <p className="font-body font-light text-sm text-earth/70 leading-relaxed">
        {description}
      </p>

      {/* Explore CTA — inline at bottom in narrow/2-col layouts (no squeeze of titles), absolute top-right only on 2xl+ where rows are wide enough */}
      <div className="clear-left flex items-center justify-end gap-1.5 mt-3 2xl:mt-0 2xl:absolute 2xl:top-4 2xl:right-4 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-orange group-hover:text-orange-light transition-colors duration-200">
        Explore
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </HashLink>
  );
}

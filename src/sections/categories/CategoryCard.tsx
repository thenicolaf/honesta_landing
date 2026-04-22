import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge, buttonVariants } from "@/shared/ui";
import { IconLeaf } from "@/shared/icons";
import { HashLink } from "../navbar";
import type { CategoryCard as CategoryCardData } from "./types";
import { CATEGORY_UI_MAP } from "./consts";

export function CategoryCard({
  slug,
  name,
  tagline,
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
    <div className="h-full flex flex-col rounded-2xl bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-colors duration-200">
      <HashLink
        href={href}
        className="block relative aspect-3/2 rounded-t-2xl overflow-hidden"
        aria-label={name}
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${placeholderBg}`}
          >
            <Icon className="w-12 h-12 text-earth/20" />
          </div>
        )}
      </HashLink>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
            {audience}
          </p>
          {badge && (
            <Badge variant="natural" size="xs">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="font-display font-semibold text-heading leading-tight capitalize text-[clamp(1rem,4vw,1.15rem)] min-[520px]:text-[clamp(1.15rem,2vw,1.4rem)]">
          {name}
        </h3>

        {tagline && (
          <p className="font-body font-light text-2xs text-earth/70 line-clamp-2">
            {tagline}
          </p>
        )}

        <div className="mt-auto pt-1 flex">
          <HashLink
            href={href}
            className={`${buttonVariants({ variant: "text", color: "warning", size: "sm" })} group whitespace-nowrap self-start`}
          >
            Explore
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </HashLink>
        </div>
      </div>
    </div>
  );
}

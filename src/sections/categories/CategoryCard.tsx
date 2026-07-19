import Image from "next/image";
import { IconLeaf } from "@/shared/icons";
import { HashLink } from "../navbar";
import type { CategoryCard as CategoryCardData } from "./types";
import { CATEGORY_UI_MAP } from "./consts";

export function CategoryCard({
  slug,
  name,
  image_url,
  href,
}: CategoryCardData) {
  const { Icon, placeholderBg } = CATEGORY_UI_MAP[slug] ?? {
    Icon: IconLeaf,
    placeholderBg: "bg-earth/10",
  };

  return (
    <HashLink
      href={href}
      aria-label={name}
      className="group relative block aspect-3/2 overflow-hidden rounded-2xl border border-parchment/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-transparent"
    >
      {image_url ? (
        <Image
          src={image_url}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center ${placeholderBg}`}
        >
          <Icon className="w-12 h-12 text-earth/20 transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-earth/85 via-earth/30 to-transparent pt-10 transition-colors duration-300 group-hover:from-earth/90" />

      <h3 className="absolute inset-x-0 bottom-0 p-3 font-display font-semibold capitalize leading-tight text-white-warm text-[clamp(1rem,4vw,1.15rem)] min-[520px]:text-[clamp(1.15rem,2vw,1.4rem)]">
        {name}
      </h3>
    </HashLink>
  );
}

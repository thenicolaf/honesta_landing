import Image from "next/image";
import { Badge } from "@/shared/ui";
import { IconInfo } from "@/shared/icons";

interface ProductImageProps {
  image_url: string;
  title: string;
  tagline: string;
  /** Slot rendered in top-right corner (e.g. FavoriteButton) */
  topRight?: React.ReactNode;
  /** Show SALE badge in top-left corner */
  sale?: boolean;
}

export function ProductImage({
  image_url,
  title,
  tagline,
  topRight,
  sale,
}: ProductImageProps) {
  return (
    <div
      className="group/img relative aspect-3/2 rounded-t-[inherit] [clip-path:inset(0_round_1rem_1rem_0_0)] focus:outline-none"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-sand transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105" />
      )}

      {sale && (
        <Badge variant="counter" size="sm" className="absolute top-3 left-3 z-20">
          SALE
        </Badge>
      )}

      {topRight}

      {/* Hint icon — visible by default, fades out when overlay appears */}
      <div className="absolute bottom-3 right-3 z-10 rounded-full bg-earth/30 p-1.5 text-white-warm backdrop-blur-sm transition-opacity duration-300 group-hover/img:opacity-0 group-focus/img:opacity-0">
        <IconInfo className="w-3.5 h-3.5" />
      </div>

      {/* Overlay — hover on desktop, focus (tap) on touch */}
      <div className="absolute inset-0 bg-earth/85 opacity-0 group-hover/img:opacity-100 group-focus/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8">
        <p className="font-body font-light text-sm text-white-warm text-center leading-relaxed">
          {tagline}
        </p>
      </div>
    </div>
  );
}

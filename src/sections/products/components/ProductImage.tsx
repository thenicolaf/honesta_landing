import Image from "next/image";
import { Badge } from "@/shared/ui";
import { SoldBadge } from "./SoldBadge";

interface ProductImageProps {
  image_url: string;
  title: string;
  /** Slot rendered in top-right corner (e.g. FavoriteButton) */
  topRight?: React.ReactNode;
  /** Show SALE badge in top-left corner */
  sale?: boolean;
  /** Product mark — shows colored badge (best_seller / new); standard = hidden */
  mark?: "standard" | "best_seller" | "new";
  /** Aggregate paid-order quantity for this product (drives SoldBadge). */
  totalSold?: number;
}

export function ProductImage({
  image_url,
  title,
  topRight,
  sale,
  mark,
  totalSold,
}: ProductImageProps) {
  return (
    <div className="relative aspect-3/2 rounded-t-2xl overflow-hidden bg-sand">
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      ) : null}

      <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1">
        {sale && (
          <Badge variant="counter" size="xs">
            SALE
          </Badge>
        )}
        {mark === "best_seller" && (
          <Badge variant="counter" size="xs" className="bg-red-700!">
            BEST SELLER
          </Badge>
        )}
        {mark === "new" && (
          <Badge variant="counter" size="xs" className="bg-moss!">
            NEW
          </Badge>
        )}
        <SoldBadge totalSold={totalSold} size="xs" />
      </div>

      {topRight}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Badge,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import { IconInfo } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

interface ProductImageProps {
  image_url: string;
  title: string;
  tagline: string;
  /** Slot rendered in top-right corner (e.g. FavoriteButton) */
  topRight?: React.ReactNode;
  /** Show SALE badge in top-left corner */
  sale?: boolean;
  /** Product mark — shows colored badge (best_seller / new); standard = hidden */
  mark?: "standard" | "best_seller" | "new";
}

export function ProductImage({
  image_url,
  title,
  tagline,
  topRight,
  sale,
  mark,
}: ProductImageProps) {
  const [showTagline, setShowTagline] = useState(false);

  return (
    <div className="relative aspect-3/2 rounded-t-[inherit] [clip-path:inset(0_round_1rem_1rem_0_0)]">
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            showTagline && "scale-105",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full bg-sand transition-transform duration-500",
            showTagline && "scale-105",
          )}
        />
      )}

      {(sale || (mark && mark !== "standard")) && (
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          {sale && (
            <Badge variant="counter" size="sm">
              SALE
            </Badge>
          )}
          {mark === "best_seller" && (
            <Badge variant="counter" size="sm" className="bg-red-700!">
              BEST SELLER
            </Badge>
          )}
          {mark === "new" && (
            <Badge variant="counter" size="sm" className="bg-moss!">
              NEW
            </Badge>
          )}
        </div>
      )}

      {topRight}

      {/* Info button — fades out when overlay is visible */}
      {tagline && (
        <Tooltip
          side="left"
          className={cn(
            "absolute bottom-3 right-3 z-20",
            showTagline && "opacity-0 pointer-events-none",
          )}
        >
          <TooltipTrigger asChild>
            <Button
              as="button"
              type="button"
              variant="text"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowTagline(true);
              }}
              className="rounded-full bg-earth/30 p-1.5! text-white-warm! backdrop-blur-sm hover:bg-earth/50 transition-all duration-300"
              aria-label="Show description"
            >
              <IconInfo className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show description</TooltipContent>
        </Tooltip>
      )}

      {/* Tagline overlay — click to dismiss */}
      <div
        className={cn(
          "absolute inset-0 bg-earth/85 flex items-center justify-center p-8 z-10 transition-opacity duration-300",
          showTagline ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowTagline(false);
        }}
      >
        <p className="font-body font-light text-sm text-white-warm text-center leading-relaxed">
          {tagline}
        </p>
      </div>
    </div>
  );
}

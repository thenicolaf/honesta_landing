"use client";

import { Button, Tooltip, TooltipTrigger, TooltipContent, toastSuccess, toastInfo, type TooltipSide } from "@/shared/ui";
import { IconHeart } from "@/shared/icons";
import { useFavorites } from "@/providers";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  tooltipSide?: TooltipSide;
}

export function FavoriteButton({ productId, className, tooltipSide = "bottom" }: FavoriteButtonProps) {
  const { isAuthenticated, isFavorite, toggleFavorite } = useFavorites();
  if (!isAuthenticated) return null;

  const active = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const wasActive = isFavorite(productId);
    toggleFavorite(productId);
    if (wasActive) {
      toastInfo("Removed from favorites");
    } else {
      toastSuccess("Added to favorites");
    }
  };

  const label = active ? "Remove from favorites" : "Add to favorites";

  return (
    <Tooltip side={tooltipSide} className={className}>
      <TooltipTrigger asChild>
        <Button
          as="button"
          variant="outline"
          size="icon"
          onClick={handleClick}
          aria-label={label}
          className={active ? "text-orange" : "text-earth/30 hover:text-orange"}
        >
          <IconHeart filled={active} className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

"use client";

import { Button } from "@/shared/ui";
import { IconHeart } from "@/shared/icons";
import { useFavorites } from "@/providers";
import { cn } from "@/shared/utils/cn";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { isAuthenticated, isFavorite, toggleFavorite } = useFavorites();
  if (!isAuthenticated) return null;

  const active = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(productId);
  };

  return (
    <Button
      as="button"
      variant="outline"
      size="icon"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={handleClick}
      className={cn(
        active ? "text-orange" : "text-earth/30 hover:text-orange",
        className,
      )}
    >
      <IconHeart filled={active} className="w-3.5 h-3.5" />
    </Button>
  );
}

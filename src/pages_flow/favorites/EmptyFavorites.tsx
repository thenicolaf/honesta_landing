import { EmptyState } from "@/shared/ui";
import { IconHeart } from "@/shared/icons";

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={<IconHeart className="w-10 h-10 text-earth/15" />}
      label="No favorites yet"
      description="Add products to your favorites by tapping the heart icon on any product card."
      action={{ label: "Browse Products", href: "/#products" }}
    />
  );
}

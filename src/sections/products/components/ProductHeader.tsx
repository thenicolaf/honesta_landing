import { Badge } from "@/shared/ui";

interface ProductHeaderProps {
  category: string;
  badge?: string;
  /** Extra badges rendered after the badge */
  extraBadges?: React.ReactNode;
}

export function ProductHeader({
  category,
  badge,
  extraBadges,
}: ProductHeaderProps) {
  const hasBadges = badge || extraBadges;

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
        {category}
      </p>
      {hasBadges && (
        <div className="flex items-center justify-between flex-wrap w-full gap-1.5 -translate-x-2">
          {badge && <Badge variant="natural">{badge}</Badge>}
          {extraBadges}
        </div>
      )}
    </div>
  );
}

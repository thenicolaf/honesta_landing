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
  return (
    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
        {category}
      </p>
      {badge && (
        <Badge variant="natural" size="xs">
          {badge}
        </Badge>
      )}
      {extraBadges && <div className="ml-auto">{extraBadges}</div>}
    </div>
  );
}

import { Badge } from "@/shared/ui";

interface ProductHeaderProps {
  category: string;
  /** Extra badges rendered after the "Natural" badge */
  extraBadges?: React.ReactNode;
}

export function ProductHeader({ category, extraBadges }: ProductHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
        {category}
      </p>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge variant="natural">Natural</Badge>
        {extraBadges}
      </div>
    </div>
  );
}

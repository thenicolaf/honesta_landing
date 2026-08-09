import Link from "next/link";
import { Badge } from "@/shared/ui";

interface ProductHeaderProps {
  category: string;
  /** When set, the category label links to the category shop page. */
  categoryHref?: string;
  badge?: string;
  /** Inline meta rendered after the badge (e.g. SoldBadge) */
  meta?: React.ReactNode;
  /** Extra badges rendered on the right side */
  extraBadges?: React.ReactNode;
}

export function ProductHeader({
  category,
  categoryHref,
  badge,
  meta,
  extraBadges,
}: ProductHeaderProps) {
  const categoryClass =
    "font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60";
  return (
    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
      {categoryHref ? (
        <Link
          href={categoryHref}
          className={`${categoryClass} hover:text-orange transition-colors duration-200`}
        >
          {category}
        </Link>
      ) : (
        <p className={categoryClass}>{category}</p>
      )}
      {badge && (
        <Badge variant="natural" size="xs">
          {badge}
        </Badge>
      )}
      {meta}
      {extraBadges && <div className="ml-auto">{extraBadges}</div>}
    </div>
  );
}

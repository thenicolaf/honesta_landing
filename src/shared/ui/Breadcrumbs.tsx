import Link from "next/link";
import { cn } from "@/shared/utils/cn";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current (last) page. */
  href?: string;
}

/**
 * Visible breadcrumb trail (Home / Shop / Category). Renders a semantic
 * <nav><ol> with the last item marked aria-current. Used on category pages and
 * reusable on product pages.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body font-medium uppercase tracking-[0.12em] text-2xs text-earth/55">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-200 hover:text-orange"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "text-earth")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden className="text-earth/30">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

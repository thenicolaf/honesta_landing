"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";

export interface NavItem {
  href: string;
  label: string;
}

export function AdminNav({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-row overflow-x-auto px-3 py-2 gap-0.5 lg:flex-col lg:overflow-x-visible lg:py-0 lg:pb-3",
        className,
      )}
    >
      {items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 justify-center items-center gap-3 rounded-xl px-4 py-2.5 font-body font-semibold text-xs uppercase tracking-widest transition-colors whitespace-nowrap lg:flex-none lg:justify-start",
            (pathname === href || (pathname.startsWith(href + "/") && href.split("/").length > 2))
              ? "text-orange bg-orange/8"
              : "text-earth/60 hover:text-orange hover:bg-orange/5",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

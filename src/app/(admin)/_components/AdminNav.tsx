"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { href: "/profile", label: "Personal Info" },
  { href: "/favorites", label: "Favorites" },
  { href: "/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row overflow-x-auto px-3 py-2 gap-0.5 lg:flex-col lg:overflow-x-visible lg:py-0 lg:pb-3">
      {NAV_ITEMS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 justify-center items-center gap-3 rounded-xl px-4 py-2.5 font-body font-semibold text-xs uppercase tracking-widest transition-colors whitespace-nowrap lg:flex-none lg:justify-start",
            pathname === href
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

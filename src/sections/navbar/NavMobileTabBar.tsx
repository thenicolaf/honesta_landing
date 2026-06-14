"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { HashLink } from "./HashLink";
import { useActiveHash } from "./useActiveHash";
import { TAB_LINKS } from "@/shared/consts/navLinks";

export function NavMobileTabBar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const activeHash = useActiveHash();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(current - prev) < 4) return;

    const atBottom =
      window.innerHeight + current >= document.body.scrollHeight - 80;

    setHidden(current < prev || atBottom);
  });

  return (
    <div
      className={cn(
        "fixed bottom-6 left-2 right-2 min-[400px]:right-auto min-[400px]:left-1/2 min-[400px]:-translate-x-1/2 z-50 lg:hidden transition-transform duration-300 ease-out",
        hidden && "translate-y-[calc(100%+1.5rem)]",
      )}
    >
      <nav
        aria-label="Mobile navigation"
        className="flex items-center justify-between min-[400px]:justify-start gap-0 min-[400px]:gap-0.5 sm:gap-1 bg-white-warm/95 backdrop-blur-md rounded-full px-2 sm:px-3 py-2 sm:py-2.5 ring-1 ring-parchment/40 shadow-[0_8px_40px_rgba(61,43,31,0.16)]"
      >
        {TAB_LINKS.map(({ href, label, Icon }) => {
          const hash = href.split("#")[1];
          const isActive = hash
            ? pathname === "/" && activeHash === `#${hash}`
            : pathname === href;

          return (
            <HashLink
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 min-[400px]:flex-none min-[400px]:min-w-14 sm:min-w-16 px-1 min-[400px]:px-2 sm:px-3 py-1.5 rounded-full transition-colors duration-200",
                isActive
                  ? "text-orange bg-sand/50"
                  : "text-earth/50 hover:text-orange hover:bg-sand/50 active:bg-sand",
              )}
            >
              <Icon className="w-5.5 h-5.5 min-[500px]:w-4.5 min-[500px]:h-4.5 sm:w-5 sm:h-5" strokeWidth={1.5} />
              <span className="hidden min-[500px]:inline font-body font-semibold uppercase text-[0.5rem] sm:text-[0.5625rem] tracking-[0.08em] min-[400px]:tracking-widest">
                {label}
              </span>
              <span className="sr-only min-[500px]:hidden">{label}</span>
            </HashLink>
          );
        })}
      </nav>
    </div>
  );
}

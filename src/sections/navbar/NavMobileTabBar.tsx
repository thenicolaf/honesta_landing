"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { HashLink } from "./HashLink";
import { useActiveHash } from "./useActiveHash";
import { TAB_LINKS } from "@/shared/consts/navLinks";

export function NavMobileTabBar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const activeHash = useActiveHash();

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
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden transition-transform duration-300 ease-out",
        hidden && "translate-y-[calc(100%+1.5rem)]",
      )}
    >
      <nav
        aria-label="Mobile navigation"
        className="flex items-center gap-0.5 sm:gap-1 bg-white-warm/95 backdrop-blur-md rounded-full px-2 sm:px-3 py-2 sm:py-2.5 ring-1 ring-parchment/40 shadow-[0_8px_40px_rgba(61,43,31,0.16)]"
      >
        {TAB_LINKS.map(({ href, label, Icon }) => {
          const hash = href.split("#")[1];
          const isActive = hash ? activeHash === `#${hash}` : false;

          return (
            <HashLink
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-14 sm:min-w-16 px-2 sm:px-3 py-1.5 rounded-full transition-colors duration-200",
                isActive
                  ? "text-orange bg-sand/50"
                  : "text-earth/50 hover:text-orange hover:bg-sand/50 active:bg-sand",
              )}
            >
              <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.5} />
              <span className="font-body font-semibold uppercase text-[0.5rem] sm:text-[0.5625rem] tracking-widest">
                {label}
              </span>
            </HashLink>
          );
        })}
      </nav>
    </div>
  );
}

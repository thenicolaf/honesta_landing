"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
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
    setHidden(current < prev);
  });

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-50 lg:hidden"
      initial={{ x: "-50%", y: 0 }}
      animate={{ x: "-50%", y: hidden ? "calc(100% + 1.5rem)" : 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
    >
      <nav
        aria-label="Mobile navigation"
        className="flex items-center gap-1 bg-white-warm/95 backdrop-blur-md rounded-full px-3 py-2.5 ring-1 ring-parchment/40 shadow-[0_8px_40px_rgba(61,43,31,0.16)]"
      >
        {TAB_LINKS.map(({ href, label, Icon }) => {
          const hash = href.split("#")[1];
          const isActive = hash ? activeHash === `#${hash}` : false;

          return (
            <HashLink
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-colors duration-200",
                isActive
                  ? "text-orange bg-sand/50"
                  : "text-earth/50 hover:text-orange hover:bg-sand/50 active:bg-sand",
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-body font-semibold uppercase text-[0.5rem] tracking-widest">
                {label}
              </span>
            </HashLink>
          );
        })}
      </nav>
    </motion.div>
  );
}

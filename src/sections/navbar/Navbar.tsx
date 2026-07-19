"use client";

import { usePathname } from "next/navigation";
import { useScroll, useTransform, motion } from "motion/react";
import { cn } from "@/shared/utils/cn";
import { NavCartButton } from "./NavCartButton";
import { NotificationBell } from "./NotificationBell";
import { NavUserButton } from "./NavUserButton";
import { NavMobileTabBar } from "./NavMobileTabBar";
import { HashLink } from "./HashLink";
import { useActiveHash } from "./useActiveHash";
import { NAV_LINKS } from "@/shared/consts/navLinks";

// ─── Sub-components ───────────────────────────────────────────────────────────

const LOGO_SIZE_LG = 43;

function NavLogo() {
  return (
    <HashLink
      href="/"
      className="flex flex-row items-center leading-none select-none"
    >
      <div className="shrink-0 mr-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/honesta_logo.svg"
          alt="Honesta logo"
          width={LOGO_SIZE_LG}
          height={LOGO_SIZE_LG}
          className="h-9 lg:h-[2.7rem] w-auto"
        />
      </div>

      <div className="flex flex-col">
        <span className="font-display font-bold text-2xl lg:text-[1.75rem] text-earth tracking-widest uppercase">
          HONESTA
        </span>
        <span className="font-body font-light text-xs uppercase tracking-[0.22em] text-bark mt-0.5 hidden sm:block">
          Sweetness Before Marketing
        </span>
      </div>
    </HashLink>
  );
}

function NavDesktopLinks() {
  const activeHash = useActiveHash();
  const pathname = usePathname();

  return (
    <ul className="hidden lg:flex items-center gap-8">
      {NAV_LINKS.map((link) => {
        const hash = link.href.split("#")[1];
        const isActive = hash
          ? pathname === "/" && activeHash === `#${hash}`
          : pathname === link.href;

        return (
          <li key={link.href}>
            <HashLink
              href={link.href}
              className={cn(
                "font-body font-semibold uppercase text-2xs tracking-[0.14em] transition-colors duration-200",
                isActive
                  ? "text-orange"
                  : "text-earth/80 hover:text-orange",
              )}
            >
              {link.label}
            </HashLink>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  isAdmin: boolean;
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  const { scrollY } = useScroll();

  const initialBlurOpacity = useTransform(scrollY, [0, 80], [1, 0]);
  const bgOpacity = useTransform(scrollY, [40, 120], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [40, 120], [0, 1]);

  return (
    <>
      <motion.header className="fixed top-0 inset-x-0 z-50">
        {/* Initial soft blur — visible at top, fades out on scroll */}
        <motion.div
          className="absolute inset-0 backdrop-blur-sm pointer-events-none"
          style={{ opacity: initialBlurOpacity }}
        />
        {/* Animated backdrop — fades in on scroll */}
        <motion.div
          className="absolute inset-0 bg-cream/92 backdrop-blur-md border-b border-parchment/40 pointer-events-none"
          style={{ opacity: bgOpacity }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-parchment to-transparent pointer-events-none"
          style={{ opacity: shadowOpacity }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            <NavLogo />
            <NavDesktopLinks />

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <NavCartButton />
              {user && <NotificationBell isAdmin={isAdmin} />}
              <NavUserButton user={user} isAdmin={isAdmin} />
            </div>
          </nav>
        </div>
      </motion.header>

      <NavMobileTabBar />
    </>
  );
}

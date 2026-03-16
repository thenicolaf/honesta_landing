"use client";

import { useScroll, useTransform, motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/shared/ui";
import { IconInstagram } from "@/shared/icons";
import { NavCartButton } from "./NavCartButton";
import { NotificationBell } from "./NotificationBell";
import { NavUserButton } from "./NavUserButton";
import { NavMobileTabBar } from "./NavMobileTabBar";
import { NAV_LINKS } from "./consts";

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLogo() {
  return (
    <Link href="/#hero" className="flex flex-col leading-none select-none">
      <span className="font-display font-bold text-2xl lg:text-[1.75rem] text-earth tracking-widest uppercase">
        HONESTA
      </span>
      <span className="font-body font-light text-xs uppercase tracking-[0.22em] text-bark mt-0.5 hidden sm:block">
        Sweetness Before Marketing
      </span>
    </Link>
  );
}

function NavDesktopLinks() {
  return (
    <ul className="hidden lg:flex items-center gap-8">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="font-body font-semibold uppercase text-2xs tracking-[0.14em] text-earth/80 hover:text-orange transition-colors duration-200"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  user: { email: string } | null;
  isAdmin: boolean;
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <>
      <motion.header className="fixed top-0 inset-x-0 z-50">
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
              {isAdmin && <NotificationBell />}
              <NavUserButton user={user} isAdmin={isAdmin} />
              <Button
                href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                <IconInstagram className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Order Now</span>
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      <NavMobileTabBar />
    </>
  );
}

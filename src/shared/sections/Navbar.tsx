"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui";
import Link from "next/link";
import { IconInstagram } from "@/shared/icons";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#categories", label: "Categories" },
  { href: "#story", label: "Story" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header className="fixed top-0 inset-x-0 z-50">
      {/* Animated backdrop — fades in on scroll */}
      <motion.div
        className="absolute inset-0 bg-cream/92 backdrop-blur-md border-b border-parchment/40"
        style={{ opacity: bgOpacity }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-parchment to-transparent"
        style={{ opacity: shadowOpacity }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none select-none">
            <span className="font-display font-bold text-2xl md:text-[28px] text-earth tracking-widest uppercase">
              HONESTA
            </span>
            <span className="font-body font-light text-[9px] uppercase tracking-[0.22em] text-bark mt-0.5 hidden sm:block">
              Sweetness Before Marketing
            </span>
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body font-semibold uppercase text-[11px] tracking-[0.14em] text-earth/80 hover:text-orange transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Button
              href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <IconInstagram className="w-3.5 h-3.5 shrink-0" />
              Order Now
            </Button>

            {/* Mobile menu toggle (visual only for now) */}
            <button
              aria-label="Open menu"
              className="md:hidden text-earth/80 hover:text-orange transition-colors duration-200"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

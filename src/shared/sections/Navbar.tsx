"use client";

import { useState } from "react";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
} from "motion/react";
import { ShoppingBag, Grid3X3, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui";
import Link from "next/link";
import { IconInstagram } from "@/shared/icons";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#categories", label: "Categories" },
  { href: "#story", label: "Story" },
  { href: "#contact", label: "Contact" },
];

const TAB_LINKS = [
  { href: "#products", label: "Products", Icon: ShoppingBag },
  { href: "#categories", label: "Categories", Icon: Grid3X3 },
  { href: "#story", label: "Story", Icon: BookOpen },
  { href: "#contact", label: "Contact", Icon: MessageCircle },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [tabHidden, setTabHidden] = useState(false);

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(current - prev) < 4) return;
    // scroll up → hide tab bar; scroll down → show
    setTabHidden(current < prev);
  });

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
            {/* Logo */}
            <Link
              href="#hero"
              className="flex flex-col leading-none select-none"
            >
              <span className="font-display font-bold text-2xl lg:text-[1.75rem] text-earth tracking-widest uppercase">
                HONESTA
              </span>
              <span className="font-body font-light text-xs uppercase tracking-[0.22em] text-bark mt-0.5 hidden sm:block">
                Sweetness Before Marketing
              </span>
            </Link>

            {/* Desktop navigation */}
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

            {/* Right actions */}
            <div className="flex items-center gap-4">
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

      {/* Mobile bottom tab bar — visible only on < lg */}
      <motion.div
        className="fixed bottom-6 left-1/2 z-50 lg:hidden"
        initial={{ x: "-50%", y: 0 }}
        animate={{ x: "-50%", y: tabHidden ? "calc(100% + 1.5rem)" : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex items-center gap-1 bg-white-warm/95 backdrop-blur-md rounded-full px-3 py-2.5 ring-1 ring-parchment/40 shadow-[0_8px_40px_rgba(61,43,31,0.16)]"
        >
          {TAB_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-earth/50 hover:text-orange hover:bg-sand/50 active:bg-sand transition-colors duration-200"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-body font-semibold uppercase text-[0.5rem] tracking-widest">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

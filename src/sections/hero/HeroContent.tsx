"use client";

import Image from "next/image";
import { Button } from "@/shared/ui";
import { HashLink } from "../navbar";
import { ShoppingBag } from "lucide-react";

export function HeroContent() {
  return (
    <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-center">
      <div className="max-w-lg pt-20 text-center relative">
        {/* Logo */}
        <div
          className="animate-hero-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Image
            src="/honesta_logo.svg"
            alt="Honesta logo"
            width={256}
            height={256}
            priority
            className="size-52 sm:size-64 mx-auto"
          />
        </div>

        {/* Brand name */}
        <h1
          className="font-display font-bold text-heading leading-none mt-6 animate-hero-fade-up"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            animationDelay: "0.28s",
          }}
        >
          HONESTA
        </h1>

        {/* Tagline */}
        <p
          className="font-body font-semibold uppercase tracking-[0.2em] text-heading text-sm sm:text-base mt-6 mb-10 animate-hero-fade-up"
          style={{ animationDelay: "0.46s" }}
        >
          No Sugar. 100% Natural Snacks
        </p>

        {/* CTA */}
        <div
          className="flex flex-col items-center gap-4 animate-hero-fade-up"
          style={{ animationDelay: "0.64s" }}
        >
          <HashLink href="/#products" className="group">
            <Button
              as="button"
              type="button"
              variant="primary"
              size="lg"
              endIcon={
                <ShoppingBag
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5"
                  strokeWidth={1.5}
                />
              }
            >
              Shop Natural Snacks
            </Button>
          </HashLink>

          <HashLink href="/?mark=best_seller#products" className="group">
            <Button
              as="button"
              type="button"
              variant="outline"
              size="md"
              className="font-display italic capitalize"
            >
              Shop Best Sellers
            </Button>
          </HashLink>
        </div>
      </div>
    </div>
  );
}

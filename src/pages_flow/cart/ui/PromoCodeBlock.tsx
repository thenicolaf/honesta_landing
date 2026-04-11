"use client";

import { Tag } from "lucide-react";
import { Card } from "@/shared/ui";
import { PromoCodeInput } from "./PromoCodeInput";

interface PromoCodeBlockProps {
  isAuthenticated: boolean;
}

export function PromoCodeBlock({ isAuthenticated }: PromoCodeBlockProps) {
  return (
    <Card
      variant="default"
      padding="md"
      className="mb-6 relative overflow-hidden"
    >
      <div
        className="absolute -right-6 -top-6 text-orange/8 rotate-12 pointer-events-none"
        aria-hidden
      >
        <Tag size={110} strokeWidth={1} />
      </div>

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange/10 text-orange">
            <Tag size={13} strokeWidth={2.2} />
          </span>
          <div>
            <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss">
              Promo Code
            </p>
            <p className="font-body font-light text-earth/55 text-2xs mt-0.5">
              {isAuthenticated
                ? "Enter your code to unlock a discount"
                : "Sign in to use promo codes"}
            </p>
          </div>
        </div>

        <PromoCodeInput isAuthenticated={isAuthenticated} />
      </div>
    </Card>
  );
}

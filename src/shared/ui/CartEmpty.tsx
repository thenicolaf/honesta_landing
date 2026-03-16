"use client";

import { Button } from "@/shared/ui";

export function CartEmpty() {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-sm">
        <p
          className="font-display font-semibold text-heading/10 leading-none select-none mb-6"
          style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
        >
          ∅
        </p>
        <h1 className="font-display font-semibold text-heading text-2xl mb-3">
          Your cart is empty
        </h1>
        <p className="font-body font-light text-earth/55 text-sm mb-8">
          Add some products to get started.
        </p>
        <Button href="/#products">Browse Products</Button>
      </div>
    </main>
  );
}

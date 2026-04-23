"use client";

import Image from "next/image";
import {
  Button,
  MixCompositionList,
  Skeleton,
} from "@/shared/ui";
import { LayoutGrid, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/sections/products/types";

interface MixSummaryProps {
  items: CartItem[];
  isHydrated: boolean;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
  onClearAll: () => void;
}

function MixSummarySkeleton() {
  return (
    <section className="rounded-2xl bg-white-warm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl bg-sand/40"
          >
            <div className="flex items-start gap-3 min-w-0 sm:flex-1">
              <Skeleton className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 pl-15 sm:pl-0">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 sm:w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MixSummary({
  items,
  isHydrated,
  onUpdateQuantity,
  onRemove,
  onClearAll,
}: MixSummaryProps) {
  if (!isHydrated) return <MixSummarySkeleton />;
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white-warm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-display font-semibold text-heading text-lg">
          Your mix boxes in cart
        </h3>
        <div className="flex items-center gap-2">
          <Button
            as="button"
            type="button"
            variant="outline"
            color="error"
            size="sm"
            onClick={onClearAll}
            startIcon={<Trash2 size={12} />}
          >
            Clear all
          </Button>
          <Button href="/cart" variant="primary" size="sm">
            View cart
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-sand/40"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-sand">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-earth/25">
                    <LayoutGrid size={24} />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 gap-1 flex-1">
                <p className="font-body font-medium text-sm text-heading truncate">
                  {item.name}
                </p>
                <p className="font-body font-light text-xs text-earth/55">
                  {item.weight_g}g · AED {item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center items-end gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Button
                    as="button"
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      item.quantity === 1
                        ? onRemove(item.variantId)
                        : onUpdateQuantity(item.variantId, item.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                    className="w-7 h-7"
                  >
                    <Minus size={12} />
                  </Button>
                  <span className="font-body font-semibold text-sm text-earth w-5 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    as="button"
                    type="button"
                    variant="primary"
                    size="icon"
                    onClick={() =>
                      onUpdateQuantity(item.variantId, item.quantity + 1)
                    }
                    aria-label="Increase quantity"
                    className="w-7 h-7"
                  >
                    <Plus size={12} />
                  </Button>
                </div>
                <p className="font-body font-semibold text-sm text-heading whitespace-nowrap sm:w-20 sm:text-right">
                  AED {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            <MixCompositionList items={item.mixItems} className="w-full mt-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

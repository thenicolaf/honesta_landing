"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button, Badge, Card, toastInfo } from "@/shared/ui";
import { useCart } from "@/providers";

export function CartItems() {
  const { items, updateItemQuantity, removeFromCart } = useCart();

  return (
    <div className="flex flex-col gap-3 mb-6">
      {items.map((item) => (
        <Card key={item.id} variant="default" padding="sm">
          <div className="flex items-center gap-4">
            {/* Image */}
            {item.image_url && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-sand">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}

            {/* Name + price */}
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-earth text-sm leading-snug truncate">
                {item.name}
              </p>
              {item.originalPrice && item.originalPrice !== item.price ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-body font-semibold text-orange text-xs">
                    AED {item.price} each
                  </span>
                  <span className="font-body text-earth/30 text-xs line-through">
                    AED {item.originalPrice}
                  </span>
                  <Badge variant="counter" size="pill">
                    -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </Badge>
                </div>
              ) : (
                <p className="font-body font-light text-earth/55 text-xs mt-0.5">
                  AED {item.price} each
                </p>
              )}
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                as="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (item.quantity === 1) {
                    removeFromCart(item.id);
                    toastInfo("Removed from cart");
                  } else {
                    updateItemQuantity(item.id, item.quantity - 1);
                  }
                }}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="font-body font-semibold text-earth text-sm w-4 text-center">
                {item.quantity}
              </span>
              <Button
                as="button"
                variant="primary"
                size="icon"
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Line total */}
            <div className="shrink-0 text-right">
              <p className="font-body font-semibold text-earth whitespace-nowrap text-sm">
                AED {(item.price * item.quantity).toFixed(2)}
              </p>
              {item.originalPrice && item.originalPrice !== item.price && (
                <p className="font-body text-earth/30 text-xs line-through whitespace-nowrap">
                  AED {(item.originalPrice * item.quantity).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button, Card } from "@/shared/ui";
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
              <p className="font-body font-light text-earth/55 text-xs mt-0.5">
                AED {item.price} each
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                as="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  item.quantity === 1
                    ? removeFromCart(item.id)
                    : updateItemQuantity(item.id, item.quantity - 1)
                }
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
            <p className="font-body font-semibold text-earth whitespace-nowrap text-sm shrink-0 text-right">
              AED {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

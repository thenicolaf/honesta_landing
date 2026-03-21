import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button, Badge, Card, toastInfo } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import type { CartItem as CartItemType } from "@/sections/products/types";

function WeightBadge({ weight_g }: { weight_g?: number }) {
  if (!weight_g) return null;
  return (
    <Badge variant="warm" size="xs">
      {weight_g}g
    </Badge>
  );
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const hasDiscount = item.originalPrice && item.originalPrice !== item.price;

  const quantityControls = (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        as="button"
        variant="outline"
        size="icon"
        onClick={() => {
          if (item.quantity === 1) {
            onRemove(item.variantId);
            toastInfo("Removed from cart");
          } else {
            onUpdateQuantity(item.variantId, item.quantity - 1);
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
        onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );

  const lineTotal = (
    <div className="shrink-0 text-right">
      <p className="font-body font-semibold text-earth whitespace-nowrap text-sm">
        AED {(item.price * item.quantity).toFixed(2)}
      </p>
      {hasDiscount && (
        <p className="font-body text-earth/30 text-xs line-through whitespace-nowrap">
          AED {(item.originalPrice! * item.quantity).toFixed(2)}
        </p>
      )}
    </div>
  );

  return (
    <Card variant="default" padding="sm">
      {/* Desktop: single row (unchanged) */}
      <div className="hidden sm:flex items-center gap-4">
        {item.image_url && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-sand">
            <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-body font-semibold text-earth text-sm leading-snug truncate">
              {item.name}
            </p>
            <WeightBadge weight_g={item.weight_g} />
          </div>
          {hasDiscount ? (
            <div className="flex flex-col gap-0.5 mt-0.5">
              <div className="flex items-center gap-2">
                <span className="font-body font-semibold text-orange text-xs">
                  AED {item.price.toFixed(2)} each
                </span>
                <span className="font-body text-earth/30 text-xs line-through">
                  AED {item.originalPrice!.toFixed(2)}
                </span>
                <Badge variant="counter" size="pill">
                  -{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%
                </Badge>
              </div>
              {item.promotionEndsAt && (
                <span className="font-body text-2xs text-earth/40">
                  Until {formatDateTime(item.promotionEndsAt)}
                </span>
              )}
            </div>
          ) : (
            <p className="font-body font-light text-earth/55 text-xs mt-0.5">
              AED {item.price.toFixed(2)} each
            </p>
          )}
        </div>
        {quantityControls}
        {lineTotal}
      </div>

      {/* Mobile: two rows */}
      <div className="sm:hidden">
        <div className="flex items-start gap-3">
          {item.image_url && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-sand">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-body font-semibold text-earth text-sm leading-snug line-clamp-2">
                {item.name}
              </p>
              <WeightBadge weight_g={item.weight_g} />
            </div>
            {hasDiscount ? (
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-body font-semibold text-orange text-xs">
                    AED {item.price.toFixed(2)}
                  </span>
                  <span className="font-body text-earth/30 text-xs line-through">
                    AED {item.originalPrice!.toFixed(2)}
                  </span>
                  <Badge variant="counter" size="pill">
                    -{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%
                  </Badge>
                </div>
                {item.promotionEndsAt && (
                  <span className="font-body text-2xs text-earth/40">
                    Until {formatDateTime(item.promotionEndsAt)}
                  </span>
                )}
              </div>
            ) : (
              <p className="font-body font-light text-earth/55 text-xs mt-1">
                AED {item.price.toFixed(2)} each
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          {quantityControls}
          {lineTotal}
        </div>
      </div>
    </Card>
  );
}

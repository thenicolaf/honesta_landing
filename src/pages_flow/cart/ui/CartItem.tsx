import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Tag } from "lucide-react";
import { Button, Badge, Card, toastInfo } from "@/shared/ui";
import { formatDateTime } from "@/shared/ui/Table";
import { cn } from "@/shared/utils/cn";
import type { CartItem as CartItemType } from "@/sections/products/types";

function stop(e: React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemImage({ src, alt, size }: { src: string; alt: string; size: number }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden shrink-0 bg-sand"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes={`${size}px`} />
    </div>
  );
}

function WeightBadge({ weight_g }: { weight_g?: number }) {
  if (!weight_g) return null;
  return (
    <Badge variant="warm" size="xs">
      {weight_g}g
    </Badge>
  );
}

function DiscountBadge({ original, current }: { original: number; current: number }) {
  return (
    <Badge variant="counter" size="pill">
      -{Math.round(((original - current) / original) * 100)}%
    </Badge>
  );
}

function PromotionPrice({ price, originalPrice, endsAt }: {
  price: number;
  originalPrice: number;
  endsAt?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-body font-semibold text-orange text-xs">
          AED {price.toFixed(2)} each
        </span>
        <span className="font-body text-earth/30 text-xs line-through">
          AED {originalPrice.toFixed(2)}
        </span>
        <DiscountBadge original={originalPrice} current={price} />
      </div>
      {endsAt && (
        <span className="font-body text-2xs text-earth/40">
          Until {formatDateTime(endsAt)}
        </span>
      )}
    </div>
  );
}

function RegularPrice({ price }: { price: number }) {
  return (
    <p className="font-body font-light text-earth/55 text-xs mt-0.5">
      AED {price.toFixed(2)} each
    </p>
  );
}

function PromoHint({ discount, endsAt }: { discount: number; endsAt?: string }) {
  return (
    <div className="flex flex-col gap-0.5 mt-0.5">
      <div className="flex items-center gap-1">
        <Tag size={10} className="text-moss shrink-0" />
        <span className="font-body text-2xs text-moss">
          Promo −AED {discount.toFixed(2)} each
        </span>
      </div>
      {endsAt && (
        <span className="font-body text-2xs text-earth/40">
          Until {formatDateTime(endsAt)}
        </span>
      )}
    </div>
  );
}

function QuantityControls({ variantId, quantity, onUpdate, onRemove }: {
  variantId: string;
  quantity: number;
  onUpdate: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        as="button"
        variant="outline"
        size="icon"
        onClick={(e) => {
          stop(e);
          if (quantity === 1) {
            onRemove(variantId);
            toastInfo("Removed from cart");
          } else {
            onUpdate(variantId, quantity - 1);
          }
        }}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>
      <span className="font-body font-semibold text-earth text-sm w-4 text-center">
        {quantity}
      </span>
      <Button
        as="button"
        variant="primary"
        size="icon"
        onClick={(e) => {
          stop(e);
          onUpdate(variantId, quantity + 1);
        }}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function LineTotal({ amount, strikethrough, color }: {
  amount: number;
  strikethrough?: number;
  color: "moss" | "orange" | "earth";
}) {
  return (
    <div className="shrink-0 text-right">
      <p className={cn("font-body font-semibold whitespace-nowrap text-sm", `text-${color}`)}>
        AED {amount.toFixed(2)}
      </p>
      {strikethrough != null && (
        <p className="font-body text-earth/30 text-xs line-through whitespace-nowrap">
          AED {strikethrough.toFixed(2)}
        </p>
      )}
    </div>
  );
}

// ─── Price info block (shared between desktop/mobile) ─────────────────────────

function PriceInfo({ item, promoHint }: {
  item: CartItemType;
  promoHint: React.ReactNode;
}) {
  const hasDiscount = item.originalPrice && item.originalPrice !== item.price;

  if (hasDiscount) {
    return (
      <div className="flex flex-col gap-0.5 mt-0.5">
        <PromotionPrice
          price={item.price}
          originalPrice={item.originalPrice!}
          endsAt={item.promotionEndsAt}
        />
        {promoHint}
      </div>
    );
  }

  return (
    <div>
      <RegularPrice price={item.price} />
      {promoHint}
    </div>
  );
}

// ─── CartItem ─────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: CartItemType;
  promoDiscountPerUnit?: number;
  promoCodeEndsAt?: string;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartItem({
  item,
  promoDiscountPerUnit = 0,
  promoCodeEndsAt,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const hasPromoCode = promoDiscountPerUnit > 0;
  const hasDiscount = item.originalPrice && item.originalPrice !== item.price;
  const finalUnitPrice = Math.max(0, item.price - promoDiscountPerUnit);
  const finalLineTotal = finalUnitPrice * item.quantity;

  const lineTotalColor = hasPromoCode ? "moss" : hasDiscount ? "orange" : "earth";
  const lineTotalStrike = hasPromoCode
    ? item.price * item.quantity
    : hasDiscount
      ? item.originalPrice! * item.quantity
      : undefined;

  const promoHint = hasPromoCode ? (
    <PromoHint discount={promoDiscountPerUnit} endsAt={promoCodeEndsAt} />
  ) : null;

  const card = (
    <Card variant="default" padding="sm">
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-4">
        {item.image_url && <ItemImage src={item.image_url} alt={item.name} size={64} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-body font-semibold text-earth text-sm leading-snug truncate">
              {item.name}
            </p>
            <WeightBadge weight_g={item.weight_g} />
          </div>
          <PriceInfo item={item} promoHint={promoHint} />
        </div>
        <QuantityControls
          variantId={item.variantId}
          quantity={item.quantity}
          onUpdate={onUpdateQuantity}
          onRemove={onRemove}
        />
        <LineTotal amount={finalLineTotal} strikethrough={lineTotalStrike} color={lineTotalColor} />
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-start gap-3">
          {item.image_url && <ItemImage src={item.image_url} alt={item.name} size={56} />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-body font-semibold text-earth text-sm leading-snug line-clamp-2">
                {item.name}
              </p>
              <WeightBadge weight_g={item.weight_g} />
            </div>
            <PriceInfo item={item} promoHint={promoHint} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <QuantityControls
            variantId={item.variantId}
            quantity={item.quantity}
            onUpdate={onUpdateQuantity}
            onRemove={onRemove}
          />
          <LineTotal amount={finalLineTotal} strikethrough={lineTotalStrike} color={lineTotalColor} />
        </div>
      </div>
    </Card>
  );

  if (item.slug) {
    return (
      <Link href={`/products/${item.slug}?from=cart`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

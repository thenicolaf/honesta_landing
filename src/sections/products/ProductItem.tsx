"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import {
  Button,
  Badge,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import { IconInfo, IconHeart } from "@/shared/icons";
import { useCart, useFavorites } from "@/providers";
import { cn } from "@/shared/utils/cn";
import type { Benefit, NutritionInfo, Product } from "./types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function FavoriteButton({ productId }: { productId: string }) {
  const { isAuthenticated, isFavorite, toggleFavorite } = useFavorites();
  if (!isAuthenticated) {
    return null;
  }
  const active = isFavorite(productId);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(productId);
  };

  return (
    <Button
      as="button"
      variant="ghost"
      size="icon"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={handleFavorite}
      className={cn(
        "absolute top-3 right-3 z-20 bg-white-warm/80 backdrop-blur-sm hover:bg-white-warm",
        active ? "text-orange" : "text-earth/30 hover:text-orange",
      )}
    >
      <IconHeart filled={active} className="w-3.5 h-3.5" />
    </Button>
  );
}

function ProductImage({
  image_url,
  title,
  tagline,
  productId,
}: {
  image_url: string;
  title: string;
  tagline: string;
  productId?: string;
}) {
  return (
    <div
      className="group/img relative aspect-3/2 overflow-hidden focus:outline-none"
      tabIndex={0}
    >
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-sand transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105" />
      )}

      {productId && <FavoriteButton productId={productId} />}

      {/* Hint icon — visible by default, fades out when overlay appears */}
      <div className="absolute bottom-3 right-3 z-10 rounded-full bg-earth/30 p-1.5 text-white-warm backdrop-blur-sm transition-opacity duration-300 group-hover/img:opacity-0 group-focus/img:opacity-0">
        <IconInfo className="w-3.5 h-3.5" />
      </div>

      {/* Overlay — hover on desktop, focus (tap) on touch */}
      <div className="absolute inset-0 bg-earth/85 opacity-0 group-hover/img:opacity-100 group-focus/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8">
        <p className="font-body font-light text-sm text-white-warm text-center leading-relaxed">
          {tagline}
        </p>
      </div>
    </div>
  );
}

function ProductHeader({
  category,
  badge,
}: {
  category: string;
  badge: Product["badge"];
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/60">
        {category}
      </p>
      <Badge variant={badge}>{badge === "warm" ? "Gourmet" : "Natural"}</Badge>
    </div>
  );
}

function ProductTitle({ title }: { title: string }) {
  return (
    <h3
      className="font-display font-semibold text-heading leading-tight"
      style={{ fontSize: "clamp(1.15rem, 2vw, 1.4rem)" }}
    >
      {title}
    </h3>
  );
}

function ProductWeight({ weight_g }: { weight_g?: number }) {
  if (weight_g == null) return null;
  return <p className="font-body text-2xs text-earth">{weight_g} g</p>;
}

function ProductTags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className="flex items-center gap-1 font-body font-light text-2xs text-moss"
        >
          <span className="w-1 h-1 rounded-full bg-moss inline-block shrink-0" />
          {tag}
        </li>
      ))}
    </ul>
  );
}

function ProductFreeFrom({ freeFrom }: { freeFrom: string[] }) {
  if (freeFrom.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {freeFrom.map((item) => (
        <li key={item} className="font-body font-light text-2xs text-earth/55">
          ✕ {item}
        </li>
      ))}
    </ul>
  );
}

function BenefitsList({ benefits }: { benefits: Benefit[] }) {
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Health Benefits
      </p>
      <ul className="flex flex-col gap-2">
        {benefits.map((b) => (
          <li key={b.name}>
            <span className="font-body font-semibold text-2xs text-earth/70 leading-snug">
              {b.name}
            </span>
            <p className="font-body font-light text-2xs text-earth/60 leading-snug mt-0.5">
              {b.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NutritionTable({ nutrition }: { nutrition: NutritionInfo }) {
  const rows = [
    { label: "Calories", value: `${nutrition.calories} kcal` },
    { label: "Carbs", value: `${nutrition.carbs} g` },
    { label: "Natural Sugars", value: `${nutrition.naturalSugars} g` },
    { label: "Added Sugars", value: `${nutrition.addedSugars} g` },
    { label: "Fiber", value: `${nutrition.fiber} g` },
    { label: "Protein", value: `${nutrition.protein} g` },
    { label: "Fat", value: `${nutrition.fat} g` },
    ...(nutrition.vitaminC !== undefined
      ? [{ label: "Vitamin C", value: `${nutrition.vitaminC} mg` }]
      : []),
  ];

  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Per 100 g
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-1">
            <span className="font-body font-light text-2xs text-earth/60">
              {label}
            </span>
            <span className="font-body font-semibold text-2xs text-earth/80">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServingIdeas({ servingIdeas }: { servingIdeas: string[] }) {
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        How to Enjoy
      </p>
      <ul className="flex flex-col gap-1">
        {servingIdeas.map((idea) => (
          <li
            key={idea}
            className="flex items-center gap-1.5 font-body font-light text-2xs text-earth/65"
          >
            <span className="w-1 h-1 rounded-full bg-earth/25 inline-block shrink-0" />
            {idea}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductDetails({
  benefits,
  nutrition,
  servingIdeas,
}: Pick<Product, "benefits" | "nutrition" | "servingIdeas">) {
  const hasContent =
    (benefits && benefits.length > 0) ||
    nutrition ||
    (servingIdeas && servingIdeas.length > 0);

  if (!hasContent) return null;

  return (
    <Collapsible className="border-t border-parchment/50 pt-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors duration-200">
        <span>Details</span>
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-4 flex flex-col gap-5">
          {benefits && benefits.length > 0 && (
            <BenefitsList benefits={benefits} />
          )}
          {nutrition && <NutritionTable nutrition={nutrition} />}
          {servingIdeas && servingIdeas.length > 0 && (
            <ServingIdeas servingIdeas={servingIdeas} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProductPriceAndCart({
  product,
}: {
  product: Pick<Product, "id" | "title" | "price" | "image_url" | "in_stock">;
}) {
  const { items, addToCart, updateItemQuantity, removeFromCart } = useCart();
  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const priceLabel =
    product.price != null ? (
      <span className="font-body font-semibold text-earth text-sm">
        AED {product.price}
      </span>
    ) : null;

  if (product.in_stock === false) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        {priceLabel}
        <Badge variant="outline" size="md">
          Out of Stock
        </Badge>
      </div>
    );
  }

  if (product.price == null || product.id == null) {
    return (
      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        size="sm"
        className="mt-auto w-full"
      >
        Order via Instagram
      </Button>
    );
  }

  if (quantity > 0) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        {priceLabel}
        <div className="flex items-center gap-2">
          <Button
            as="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              quantity === 1
                ? removeFromCart(product.id!)
                : updateItemQuantity(product.id!, quantity - 1)
            }
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
            onClick={() => updateItemQuantity(product.id!, quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
      {priceLabel}
      <Button
        as="button"
        variant="primary"
        size="sm"
        onClick={() =>
          addToCart({
            id: product.id!,
            name: product.title,
            price: product.price!,
            image_url: product.image_url,
          })
        }
      >
        Add to Cart
      </Button>
    </div>
  );
}

// ─── ProductItem ──────────────────────────────────────────────────────────────

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  const {
    title,
    category,
    badge,
    tagline,
    tags,
    freeFrom,
    image_url,
    weight_g,
    benefits,
    nutrition,
    servingIdeas,
  } = product;

  return (
    <div className="h-full flex flex-col rounded-[16px] overflow-hidden bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300">
      <ProductImage
        image_url={image_url}
        title={title}
        tagline={tagline}
        productId={product.id ?? undefined}
      />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader category={category} badge={badge} />
        <ProductTitle title={title} />
        <ProductWeight weight_g={weight_g} />
        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductDetails
          benefits={benefits}
          nutrition={nutrition}
          servingIdeas={servingIdeas}
        />
        <ProductPriceAndCart product={product} />
      </div>
    </div>
  );
}

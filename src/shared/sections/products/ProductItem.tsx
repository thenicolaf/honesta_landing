"use client";

import Image from "next/image";
import { Badge, Collapsible, CollapsibleTrigger, CollapsibleChevron, CollapsibleContent } from "@/shared/ui";
import { IconInfo } from "@/shared/icons";
import type { Benefit, NutritionInfo, Product } from "./types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductImage({
  image,
  title,
  tagline,
}: {
  image: string;
  title: string;
  tagline: string;
}) {
  return (
    <div
      className="group/img relative aspect-3/2 overflow-hidden focus:outline-none"
      tabIndex={0}
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-sand transition-transform duration-500 group-hover/img:scale-105 group-focus/img:scale-105" />
      )}

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
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-[10px] text-earth/40">
        {category}
      </p>
      <Badge variant={badge}>{badge === "warm" ? "Gourmet" : "Natural"}</Badge>
    </div>
  );
}

function ProductTitle({ title }: { title: string }) {
  return (
    <h3
      className="font-display font-semibold text-earth leading-tight"
      style={{ fontSize: "clamp(1.15rem, 2vw, 1.4rem)" }}
    >
      {title}
    </h3>
  );
}

function ProductTags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className="flex items-center gap-1 font-body font-light text-[11px] text-moss"
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
        <li
          key={item}
          className="font-body font-light text-[11px] text-earth/35"
        >
          ✕ {item}
        </li>
      ))}
    </ul>
  );
}

function BenefitsList({ benefits }: { benefits: Benefit[] }) {
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-[9px] text-earth/35 mb-2.5">
        Health Benefits
      </p>
      <ul className="flex flex-col gap-2">
        {benefits.map((b) => (
          <li key={b.name}>
            <span className="font-body font-semibold text-[11px] text-earth/70 leading-snug">
              {b.name}
            </span>
            <p className="font-body font-light text-[11px] text-earth/45 leading-snug mt-0.5">
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
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-[9px] text-earth/35 mb-2.5">
        Per 100 g
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-1">
            <span className="font-body font-light text-[11px] text-earth/40">
              {label}
            </span>
            <span className="font-body font-semibold text-[11px] text-earth/65">
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
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-[9px] text-earth/35 mb-2.5">
        How to Enjoy
      </p>
      <ul className="flex flex-col gap-1">
        {servingIdeas.map((idea) => (
          <li
            key={idea}
            className="flex items-center gap-1.5 font-body font-light text-[11px] text-earth/50"
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
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 font-body font-semibold uppercase tracking-[0.12em] text-[11px] text-earth/40 hover:text-orange transition-colors duration-200">
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

function ProductCta() {
  return (
    <a
      href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto pt-1 flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-[11px] text-earth/40 hover:text-orange transition-colors duration-200 w-fit"
    >
      <span aria-hidden="true">▸</span>
      Ask on Instagram
    </a>
  );
}

// ─── ProductItem ──────────────────────────────────────────────────────────────

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  const { title, category, badge, tagline, tags, freeFrom, image, benefits, nutrition, servingIdeas } = product;

  return (
    <div className="h-full flex flex-col rounded-[16px] overflow-hidden bg-white-warm border border-parchment/60 hover:shadow-lg hover:border-transparent transition-all duration-300">
      <ProductImage image={image} title={title} tagline={tagline} />

      <div className="flex-1 p-5 flex flex-col gap-3">
        <ProductHeader category={category} badge={badge} />
        <ProductTitle title={title} />
        <ProductTags tags={tags} />
        <ProductFreeFrom freeFrom={freeFrom} />
        <ProductDetails benefits={benefits} nutrition={nutrition} servingIdeas={servingIdeas} />
        <ProductCta />
      </div>
    </div>
  );
}

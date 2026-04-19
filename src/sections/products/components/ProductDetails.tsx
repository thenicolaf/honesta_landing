import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import type { Benefit, NutritionInfo } from "../types";
import { ProductTags } from "./ProductTags";
import { ProductFreeFrom } from "./ProductFreeFrom";
import { ProductIngredients } from "./ProductIngredients";

// ─── BenefitsList ─────────────────────────────────────────────────────────────

export function BenefitsList({ benefits }: { benefits: Benefit[] }) {
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

// ─── NutritionTable ───────────────────────────────────────────────────────────

export function NutritionTable({ nutrition }: { nutrition: NutritionInfo }) {
  const rows = Object.values(nutrition).map((field) => ({
    label: field.name,
    value: String(field.value),
  }));

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

// ─── ProductTagsSection ──────────────────────────────────────────────────────

export function ProductTagsSection({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Tags
      </p>
      <ProductTags tags={tags} />
    </div>
  );
}

// ─── ProductFreeFromSection ──────────────────────────────────────────────────

export function ProductFreeFromSection({ freeFrom }: { freeFrom: string[] }) {
  if (freeFrom.length === 0) return null;
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Free From
      </p>
      <ProductFreeFrom freeFrom={freeFrom} />
    </div>
  );
}

// ─── ProductIngredientsSection ───────────────────────────────────────────────

export function ProductIngredientsSection({
  ingredients,
}: {
  ingredients: string[];
}) {
  if (ingredients.length === 0) return null;
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Ingredients
      </p>
      <ProductIngredients ingredients={ingredients} />
    </div>
  );
}

// ─── ServingIdeas ─────────────────────────────────────────────────────────────

export function ServingIdeas({ servingIdeas }: { servingIdeas: string[] }) {
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        How to Enjoy
      </p>
      <ul className="flex flex-col gap-1">
        {servingIdeas.map((idea) => (
          <li
            key={idea}
            className="flex items-center gap-1.5 font-body font-light text-2xs text-orange/85"
          >
            <span className="w-1 h-1 rounded-full bg-orange/60 inline-block shrink-0" />
            {idea}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── ProductOccasions ────────────────────────────────────────────────────────

export function ProductOccasions({ occasions }: { occasions: string[] }) {
  return (
    <div>
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-2xs text-earth/55 mb-2.5">
        Occasions
      </p>
      <ul className="flex flex-col gap-1">
        {occasions.map((occasion) => (
          <li
            key={occasion}
            className="flex items-center gap-1.5 font-body font-light text-2xs text-earth/65"
          >
            <span className="w-1 h-1 rounded-full bg-earth/25 inline-block shrink-0" />
            {occasion}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Shared details content ─────────────────────────────────────────────────

interface DetailsContentProps {
  benefits?: Benefit[];
  nutrition?: NutritionInfo;
  servingIdeas?: string[];
  occasions?: string[];
  tags?: string[];
  freeFrom?: string[];
  ingredients?: string[];
}

export function hasDetailsContent({
  benefits,
  nutrition,
  servingIdeas,
  occasions,
  tags,
  freeFrom,
  ingredients,
}: DetailsContentProps) {
  return (
    (benefits && benefits.length > 0) ||
    nutrition ||
    (servingIdeas && servingIdeas.length > 0) ||
    (occasions && occasions.length > 0) ||
    (tags && tags.length > 0) ||
    (freeFrom && freeFrom.length > 0) ||
    (ingredients && ingredients.length > 0)
  );
}

function hasGridContent({
  servingIdeas,
  occasions,
  tags,
  freeFrom,
}: Pick<DetailsContentProps, "servingIdeas" | "occasions" | "tags" | "freeFrom">) {
  return (
    (tags && tags.length > 0) ||
    (freeFrom && freeFrom.length > 0) ||
    (servingIdeas && servingIdeas.length > 0) ||
    (occasions && occasions.length > 0)
  );
}

function DetailsContent({
  benefits,
  nutrition,
  servingIdeas,
  occasions,
  tags,
  freeFrom,
  ingredients,
}: DetailsContentProps) {
  return (
    <>
      {benefits && benefits.length > 0 && <BenefitsList benefits={benefits} />}
      {nutrition && <NutritionTable nutrition={nutrition} />}
      {ingredients && ingredients.length > 0 && (
        <ProductIngredientsSection ingredients={ingredients} />
      )}
      {hasGridContent({ servingIdeas, occasions, tags, freeFrom }) && (
        <div className="grid grid-cols-2 gap-4">
          {tags && tags.length > 0 && <ProductTagsSection tags={tags} />}
          {freeFrom && freeFrom.length > 0 && (
            <ProductFreeFromSection freeFrom={freeFrom} />
          )}
          {servingIdeas && servingIdeas.length > 0 && (
            <ServingIdeas servingIdeas={servingIdeas} />
          )}
          {occasions && occasions.length > 0 && (
            <ProductOccasions occasions={occasions} />
          )}
        </div>
      )}
    </>
  );
}

// ─── ProductExpandedDetails ──────────────────────────────────────────────────

export function ProductExpandedDetails({
  benefits,
  nutrition,
  servingIdeas,
  occasions,
  tags,
  freeFrom,
  ingredients,
}: DetailsContentProps) {
  if (
    !hasDetailsContent({
      benefits,
      nutrition,
      servingIdeas,
      occasions,
      tags,
      freeFrom,
      ingredients,
    })
  )
    return null;

  return (
    <div className="flex flex-col gap-6 pt-5 border-t border-parchment/50">
      {/* Benefits ul is overridden to a 2-column grid so short descriptions
          don't leave large empty space on the right. */}
      {benefits && benefits.length > 0 && (
        <div className="[&_ul]:grid [&_ul]:grid-cols-2 [&_ul]:gap-x-4 [&_ul]:gap-y-2.5">
          <BenefitsList benefits={benefits} />
        </div>
      )}
      {nutrition && <NutritionTable nutrition={nutrition} />}
      {ingredients && ingredients.length > 0 && (
        <ProductIngredientsSection ingredients={ingredients} />
      )}
      {hasGridContent({ servingIdeas, occasions, tags, freeFrom }) && (
        <div className="grid grid-cols-2 gap-4">
          {tags && tags.length > 0 && <ProductTagsSection tags={tags} />}
          {freeFrom && freeFrom.length > 0 && (
            <ProductFreeFromSection freeFrom={freeFrom} />
          )}
          {servingIdeas && servingIdeas.length > 0 && (
            <ServingIdeas servingIdeas={servingIdeas} />
          )}
          {occasions && occasions.length > 0 && (
            <ProductOccasions occasions={occasions} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── ProductDetails ───────────────────────────────────────────────────────────

export function ProductDetails(props: DetailsContentProps) {
  if (!hasDetailsContent(props)) return null;

  return (
    <Collapsible className="border-t border-parchment/50 pt-3">
      <Tooltip side="top" className="block">
        <TooltipTrigger asChild>
          <CollapsibleTrigger
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="flex w-full items-center justify-between gap-2 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors duration-200"
          >
            Details
            <CollapsibleChevron />
          </CollapsibleTrigger>
        </TooltipTrigger>
        <TooltipContent>Benefits, nutrition & more</TooltipContent>
      </Tooltip>
      <CollapsibleContent>
        <div className="pt-4 flex flex-col gap-5">
          <DetailsContent {...props} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

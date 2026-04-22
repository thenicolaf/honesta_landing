import { ProductIngredients } from "./ProductIngredients";

interface IngredientsInlineProps {
  ingredients: string[];
}

export function IngredientsInline({ ingredients }: IngredientsInlineProps) {
  if (ingredients.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="font-body font-semibold uppercase tracking-[0.13em] text-[0.55rem] text-earth/50">
        Ingredients
      </p>
      <ProductIngredients ingredients={ingredients} />
    </div>
  );
}

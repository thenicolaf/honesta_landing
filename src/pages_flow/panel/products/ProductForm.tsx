"use client";

import { useActionState } from "react";
import { Button } from "@/shared/ui";
import type { AdminDbProduct, ProductFormOptions } from "@/lib/productsDb";
import { createProduct, updateProduct, type ProductState } from "./actions";
import { BasicInfoSection } from "./product-form/BasicInfoSection";
import { VariantsSection } from "./product-form/VariantsSection";
import { CategorySection } from "./product-form/CategorySection";
import { TagsSection } from "./product-form/TagsSection";
import { BenefitsSection } from "./product-form/BenefitsSection";
import { NutritionSection } from "./product-form/NutritionSection";

interface ProductFormProps {
  product?: AdminDbProduct;
  options: ProductFormOptions;
}

export function ProductForm({ product, options }: ProductFormProps) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;

  const [state, dispatch, isPending] = useActionState<
    ProductState | null,
    FormData
  >(action, null);

  const sectionProps = { product, options, state };

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <BasicInfoSection {...sectionProps} />
      <VariantsSection {...sectionProps} />
      <CategorySection {...sectionProps} />
      <TagsSection {...sectionProps} />
      <BenefitsSection {...sectionProps} />
      <NutritionSection {...sectionProps} />

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/products"
          variant="secondary"
          color={"default"}
          size="sm"
        >
          Cancel
        </Button>
        {product ? (
          <Button
            as="button"
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <>
            <Button
              as="button"
              type="submit"
              name="status"
              value="draft"
              variant="secondary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save as draft"}
            </Button>
            <Button
              as="button"
              type="submit"
              name="status"
              value="published"
              variant="primary"
              size="sm"
              disabled={isPending}
            >
              {isPending ? "Publishing…" : "Publish"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}

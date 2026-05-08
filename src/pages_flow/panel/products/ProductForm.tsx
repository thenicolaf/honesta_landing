"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, toastError } from "@/shared/ui";
import type { AdminDbProduct, ProductFormOptions } from "@/lib/productsDb";
import { createProduct, updateProduct, type ProductState } from "./actions";
import { BasicInfoSection } from "./product-form/BasicInfoSection";
import { VariantsSection } from "./product-form/VariantsSection";
import { InventorySection } from "./product-form/InventorySection";
import { CategorySection } from "./product-form/CategorySection";
import { IngredientsSection } from "./product-form/IngredientsSection";
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

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  const sectionProps = { product, options, state };

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <BasicInfoSection {...sectionProps} />
      <VariantsSection {...sectionProps} />
      <InventorySection {...sectionProps} />
      <CategorySection {...sectionProps} />
      <IngredientsSection {...sectionProps} />
      <TagsSection {...sectionProps} />
      <BenefitsSection {...sectionProps} />
      <NutritionSection {...sectionProps} />

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

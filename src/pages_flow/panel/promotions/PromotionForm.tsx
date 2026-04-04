"use client";

import { useActionState, useState } from "react";
import {
  FormLabel,
  FormInput,
  FormNumberInput,
  FormSelect,
  FormCheckbox,
  FormDatePicker,
  FormError,
  Button,
} from "@/shared/ui";
import { ProductPicker, type ProductOption } from "./ProductPicker";
import type { PromotionWithProducts } from "@/lib/promotionsDb";
import {
  createPromotionAction,
  updatePromotionAction,
  type PromotionState,
} from "./actions";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed (AED)" },
];

interface PromotionFormProps {
  promotion?: PromotionWithProducts;
  products: ProductOption[];
}

export function PromotionForm({ promotion, products }: PromotionFormProps) {
  const action = promotion
    ? updatePromotionAction.bind(null, promotion.id)
    : createPromotionAction;

  const [state, dispatch, isPending] = useActionState<
    PromotionState | null,
    FormData
  >(action, null);

  const [discountType, setDiscountType] = useState(
    state?.values?.discount_type ?? promotion?.discount_type ?? "percentage",
  );
  const [discountValue, setDiscountValue] = useState(
    parseFloat(state?.values?.discount_value ?? "") ||
      (promotion?.discount_value ?? 0),
  );

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Promotion info
        </p>

        <div>
          <FormLabel htmlFor="promo-name" required>
            Name
          </FormLabel>
          <FormInput
            id="promo-name"
            name="name"
            placeholder="e.g. Spring Sale"
            defaultValue={state?.values?.name ?? promotion?.name ?? ""}
            state={state?.fieldErrors?.name ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.name} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="promo-discount-type">Discount Type</FormLabel>
            <FormSelect
              id="promo-discount-type"
              name="discount_type"
              options={DISCOUNT_TYPE_OPTIONS}
              value={discountType}
              onValueChange={setDiscountType}
            />
          </div>
          <div>
            <FormLabel htmlFor="promo-discount-value" required>
              Discount Value
            </FormLabel>
            <FormNumberInput
              id="promo-discount-value"
              name="discount_value"
              min={0}
              max={discountType === "percentage" ? 100 : undefined}
              step={1}
              placeholder={
                discountType === "percentage" ? "e.g. 20" : "e.g. 10"
              }
              value={discountValue}
              onValueChange={setDiscountValue}
              state={state?.fieldErrors?.discount_value ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.discount_value} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormDatePicker
            id="promo-starts"
            name="starts_at"
            label="Start Date"
            showTime
            required
            defaultValue={
              state?.values?.starts_at
                ? new Date(state.values.starts_at)
                : promotion
                  ? new Date(promotion.starts_at)
                  : undefined
            }
            state={state?.fieldErrors?.starts_at ? "error" : "default"}
            errorMessage={state?.fieldErrors?.starts_at}
          />
          <FormDatePicker
            id="promo-ends"
            name="ends_at"
            label="End Date"
            showTime
            required
            defaultValue={
              state?.values?.ends_at
                ? new Date(state.values.ends_at)
                : promotion
                  ? new Date(promotion.ends_at)
                  : undefined
            }
            state={state?.fieldErrors?.ends_at ? "error" : "default"}
            errorMessage={state?.fieldErrors?.ends_at}
          />
        </div>

        <div>
          <FormLabel required>Products</FormLabel>
          <ProductPicker
            name="product_ids"
            options={products}
            defaultValue={promotion?.product_ids ?? []}
            discountType={discountType}
            discountValue={discountValue}
            state={state?.fieldErrors?.product_ids ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.product_ids} />
        </div>

        <FormCheckbox
          name="is_active"
          label="Active"
          defaultChecked={promotion?.is_active ?? true}
        />
      </div>

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/promotions"
          variant="secondary"
          color="default"
          size="sm"
        >
          Cancel
        </Button>
        <Button
          as="button"
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending}
        >
          {isPending ? "Saving…" : promotion ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}

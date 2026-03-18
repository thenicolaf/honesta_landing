"use client";

import { useActionState, useState } from "react";
import {
  FormLabel,
  FormInput,
  FormNumberInput,
  FormSelect,
  FormCheckbox,
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

function toDatetimeLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
    parseFloat(state?.values?.discount_value ?? "") || (promotion?.discount_value ?? 0),
  );

  return (
    <form key={state?.attempt ?? 0} action={dispatch} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Promotion info
        </p>

        <div>
          <FormLabel htmlFor="promo-name">Name *</FormLabel>
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
            <FormLabel htmlFor="promo-discount-value">Discount Value *</FormLabel>
            <FormNumberInput
              id="promo-discount-value"
              name="discount_value"
              min={0}
              max={discountType === "percentage" ? 100 : undefined}
              step={1}
              placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 10"}
              value={discountValue}
              onValueChange={setDiscountValue}
              state={state?.fieldErrors?.discount_value ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.discount_value} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="promo-starts">Start Date *</FormLabel>
            <FormInput
              id="promo-starts"
              name="starts_at"
              type="datetime-local"
              defaultValue={
                state?.values?.starts_at ??
                (promotion ? toDatetimeLocal(promotion.starts_at) : "")
              }
              state={state?.fieldErrors?.starts_at ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.starts_at} />
          </div>
          <div>
            <FormLabel htmlFor="promo-ends">End Date *</FormLabel>
            <FormInput
              id="promo-ends"
              name="ends_at"
              type="datetime-local"
              defaultValue={
                state?.values?.ends_at ??
                (promotion ? toDatetimeLocal(promotion.ends_at) : "")
              }
              state={state?.fieldErrors?.ends_at ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.ends_at} />
          </div>
        </div>

        <div>
          <FormLabel>Products *</FormLabel>
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

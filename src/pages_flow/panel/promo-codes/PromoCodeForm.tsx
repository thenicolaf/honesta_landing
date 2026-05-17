"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Info, RefreshCw } from "lucide-react";
import {
  FormLabel,
  FormInput,
  FormNumberInput,
  FormSelect,
  FormCheckbox,
  FormDatePicker,
  FormTileRadio,
  FormTileRadioItem,
  FormError,
  Button,
  toastError,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/ui";
import {
  ProductPicker,
  type ProductOption,
} from "@/pages_flow/panel/promotions/ProductPicker";
import { UserPicker, type UserOption } from "./UserPicker";
import type { PromoCodeWithRelations } from "@/lib/promoCodesDb";
import {
  generatePromoCode,
  PROMO_CODE_MAX_LENGTH,
} from "@/shared/utils/promoCode";
import {
  createPromoCodeAction,
  updatePromoCodeAction,
  type PromoCodeState,
} from "./actions";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed (AED)" },
];

interface PromoCodeFormProps {
  promoCode?: PromoCodeWithRelations;
  products: ProductOption[];
  users: UserOption[];
  prefilledUserIds?: string[];
}

export function PromoCodeForm({
  promoCode,
  products,
  users,
  prefilledUserIds,
}: PromoCodeFormProps) {
  const action = promoCode
    ? updatePromoCodeAction.bind(null, promoCode.id)
    : createPromoCodeAction;

  const [state, dispatch, isPending] = useActionState<
    PromoCodeState | null,
    FormData
  >(action, null);

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  const [code, setCode] = useState(
    state?.values?.code ?? promoCode?.code ?? "",
  );
  const [scope, setScope] = useState(
    state?.values?.scope ?? promoCode?.scope ?? "cart",
  );
  const [discountType, setDiscountType] = useState(
    state?.values?.discount_type ?? promoCode?.discount_type ?? "percentage",
  );
  const [discountValue, setDiscountValue] = useState(
    parseFloat(state?.values?.discount_value ?? "") ||
      (promoCode?.discount_value ?? 0),
  );

  const [startsAt, setStartsAt] = useState<Date | undefined>(() =>
    state?.values?.starts_at
      ? new Date(state.values.starts_at)
      : promoCode
        ? new Date(promoCode.starts_at)
        : undefined,
  );
  const [endsAt, setEndsAt] = useState<Date | undefined>(() => {
    if (state?.values?.ends_at) return new Date(state.values.ends_at);
    if (promoCode?.ends_at) return new Date(promoCode.ends_at);
    return undefined;
  });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(
      e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9%_-]/g, "")
        .slice(0, PROMO_CODE_MAX_LENGTH),
    );
  };

  const handleGenerate = () => {
    setCode(generatePromoCode());
  };

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Promo code info
        </p>

        <div>
          <FormLabel htmlFor="promo-code" required>
            Code
          </FormLabel>
          <div className="flex items-center gap-2">
            <FormInput
              id="promo-code"
              name="code"
              placeholder="ANNA-VIP"
              value={code}
              onChange={handleCodeChange}
              maxLength={PROMO_CODE_MAX_LENGTH}
              className="font-mono tracking-widest uppercase"
              wrapperClassName="flex-1"
              state={state?.fieldErrors?.code ? "error" : "default"}
            />
            <Button
              as="button"
              type="button"
              variant="outline"
              size="md"
              onClick={handleGenerate}
              startIcon={<RefreshCw size={13} />}
            >
              Generate
            </Button>
          </div>
          <FormError message={state?.fieldErrors?.code} />
        </div>

        <div>
          <FormLabel>Scope</FormLabel>
          <FormTileRadio name="scope" value={scope} onValueChange={setScope}>
            <FormTileRadioItem value="cart">Whole cart</FormTileRadioItem>
            <FormTileRadioItem value="product">
              Specific products
            </FormTileRadioItem>
          </FormTileRadio>
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

        <div>
          <FormLabel htmlFor="promo-min-order">
            Minimum order amount (AED)
          </FormLabel>
          <FormNumberInput
            id="promo-min-order"
            name="min_order_amount"
            min={0}
            step={1}
            placeholder="Optional — leave empty for no minimum"
            defaultValue={
              state?.values?.min_order_amount ??
              (promoCode?.min_order_amount != null
                ? String(promoCode.min_order_amount)
                : "")
            }
            state={state?.fieldErrors?.min_order_amount ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.min_order_amount} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormDatePicker
            id="promo-starts"
            name="starts_at"
            label="Start Date"
            placeholder="When code becomes active"
            showTime
            required
            clearable
            value={startsAt}
            onValueChange={setStartsAt}
            minDate={new Date()}
            maxDate={endsAt}
            state={state?.fieldErrors?.starts_at ? "error" : "default"}
            errorMessage={state?.fieldErrors?.starts_at}
          />
          <FormDatePicker
            id="promo-ends"
            name="ends_at"
            label="End Date"
            placeholder="Optional — unlimited if empty"
            showTime
            clearable
            value={endsAt}
            onValueChange={setEndsAt}
            minDate={startsAt ?? new Date()}
            state={state?.fieldErrors?.ends_at ? "error" : "default"}
            errorMessage={state?.fieldErrors?.ends_at}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="promo-max-uses">Max uses (total)</FormLabel>
            <FormNumberInput
              id="promo-max-uses"
              name="max_uses"
              min={1}
              step={1}
              placeholder="Optional — unlimited if empty"
              defaultValue={
                state?.values?.max_uses ??
                (promoCode?.max_uses != null ? String(promoCode.max_uses) : "")
              }
              state={state?.fieldErrors?.max_uses ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.max_uses} />
          </div>
          <div>
            <FormLabel htmlFor="promo-max-uses-per-user">
              Max uses per user
            </FormLabel>
            <FormNumberInput
              id="promo-max-uses-per-user"
              name="max_uses_per_user"
              min={1}
              step={1}
              placeholder="1 = single-use per user"
              defaultValue={
                state?.values?.max_uses_per_user ??
                (promoCode?.max_uses_per_user != null
                  ? String(promoCode.max_uses_per_user)
                  : "")
              }
              state={
                state?.fieldErrors?.max_uses_per_user ? "error" : "default"
              }
            />
            <FormError message={state?.fieldErrors?.max_uses_per_user} />
          </div>
        </div>

        {scope === "product" && (
          <div>
            <FormLabel required>Products</FormLabel>
            <ProductPicker
              name="product_ids"
              options={products}
              defaultValue={promoCode?.product_ids ?? []}
              discountType={discountType}
              discountValue={discountValue}
              state={state?.fieldErrors?.product_ids ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.product_ids} />
          </div>
        )}

        <div>
          <div className="flex items-end gap-1">
            <FormLabel>Eligible users</FormLabel>
            <Tooltip side="top">
              <TooltipTrigger asChild>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  size="icon"
                  aria-label="Eligible users info"
                  className="text-earth/40 hover:text-earth/70 "
                >
                  <Info size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-64 whitespace-normal text-left leading-snug">
                Leave empty to make the code available to all signed-in users.
                Otherwise the code works only for the selected users.
              </TooltipContent>
            </Tooltip>
          </div>
          <UserPicker
            name="user_ids"
            options={users}
            defaultValue={promoCode?.user_ids ?? prefilledUserIds ?? []}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormCheckbox
            name="is_active"
            label="Active"
            defaultChecked={promoCode?.is_active ?? true}
          />

          <div className="flex items-center gap-1">
            <FormCheckbox
              name="stack_with_promotions"
              label="Stack with existing product promotions"
              defaultChecked={promoCode?.stack_with_promotions ?? false}
            />
            <Tooltip side="top">
              <TooltipTrigger asChild>
                <Button
                  as="button"
                  type="button"
                  variant="text"
                  size="icon"
                  aria-label="Stack with promotions info"
                  className="text-earth/40 hover:text-earth/70"
                >
                  <Info size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-64 whitespace-normal text-left leading-snug">
                When enabled, the discount applies on top of products already on
                sale. When disabled, products on sale are excluded from this
                code.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="font-body text-red-500 text-2xs">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/promo-codes"
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
          {isPending ? "Saving…" : promoCode ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}

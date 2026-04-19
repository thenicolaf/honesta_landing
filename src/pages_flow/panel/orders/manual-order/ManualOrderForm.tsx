"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  FormLabel,
  FormInput,
  FormPhoneInput,
  FormTextarea,
  FormError,
  Button,
  toastError,
} from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import type { Product } from "@/sections/products/types/types";
import { parseAddress, mapAddressFieldErrors } from "@/shared/utils/address";
import { calculateDelivery } from "@/shared/utils/calculateDelivery";
import type { DeliverySetting } from "@/lib/deliveryDb";
import type { MixBox } from "@/lib/mixBoxesDb";
import {
  OrderItemsPicker,
  emptyRow,
  type ItemRow,
} from "./OrderItemsPicker";
import { AdminMixBuilder, type PendingMix } from "./AdminMixBuilder";
import {
  createManualOrderAction,
  type ManualOrderState,
} from "./actions";

const AddressWithMap = dynamic(
  () => import("@/shared/ui/AddressWithMap").then((m) => m.AddressWithMap),
  { ssr: false },
);

interface Props {
  products: Product[];
  deliverySettings: DeliverySetting[];
  boxes: MixBox[];
}

export function ManualOrderForm({ products, deliverySettings, boxes }: Props) {
  const [state, dispatch, isPending] = useActionState<
    ManualOrderState | null,
    FormData
  >(createManualOrderAction, null);

  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [mixes, setMixes] = useState<PendingMix[]>([]);
  const [emirate, setEmirate] = useState<string>("Dubai");

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  const defaults = state?.values ?? {};
  const addressFieldErrors = mapAddressFieldErrors(state?.fieldErrors);

  const productMap = new Map(products.map((p) => [p.id ?? "", p]));
  const boxMap = new Map(boxes.map((b) => [b.id, b]));
  let subtotal = 0;
  let promotionDiscount = 0;
  for (const r of rows) {
    if (!r.variantId || r.quantity <= 0) continue;
    const product = productMap.get(r.productId);
    const variant = product?.variants.find((v) => v.id === r.variantId);
    if (!product || !variant) continue;
    const originalPrice = variant.price;
    const finalPrice = product.promotion
      ? product.promotion.discountedPrice
      : originalPrice;
    subtotal += finalPrice * r.quantity;
    promotionDiscount += (originalPrice - finalPrice) * r.quantity;
  }
  for (const m of mixes) {
    const box = boxMap.get(m.boxId);
    if (!box) continue;
    for (const s of m.selections) {
      const preset = box.presets.find((p) => p.id === s.presetId);
      if (!preset) continue;
      subtotal += Number(preset.price) * s.count;
    }
  }
  const delivery = calculateDelivery(subtotal, emirate, deliverySettings);
  const total = subtotal + delivery.fee;

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Customer info
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="firstName" required>
              First name
            </FormLabel>
            <FormInput
              id="firstName"
              name="firstName"
              defaultValue={defaults.firstName}
              placeholder="Ahmed"
              state={state?.fieldErrors?.firstName ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.firstName} />
          </div>
          <div>
            <FormLabel htmlFor="lastName" required>
              Last name
            </FormLabel>
            <FormInput
              id="lastName"
              name="lastName"
              defaultValue={defaults.lastName}
              placeholder="Al Rashid"
              state={state?.fieldErrors?.lastName ? "error" : "default"}
            />
            <FormError message={state?.fieldErrors?.lastName} />
          </div>
        </div>

        <div>
          <FormLabel htmlFor="email" required>
            Email
          </FormLabel>
          <FormInput
            id="email"
            name="email"
            type="email"
            defaultValue={defaults.email}
            placeholder="you@example.com"
            state={state?.fieldErrors?.email ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.email} />
        </div>

        <div>
          <FormLabel htmlFor="phone" required>
            Phone
          </FormLabel>
          <FormPhoneInput
            id="phone"
            name="phone"
            defaultValue={defaults.phone}
            state={state?.fieldErrors?.phone ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.phone} />
        </div>
      </div>

      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Delivery address
        </p>

        <AddressWithMap
          {...parseAddress(defaults.address)}
          defaultLat={defaults.lat}
          defaultLng={defaults.lng}
          fieldErrors={addressFieldErrors}
          onEmirateChange={setEmirate}
        />
      </div>

      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Products
        </p>

        <OrderItemsPicker
          products={products}
          rows={rows}
          onChange={setRows}
          error={state?.fieldErrors?.items}
        />
      </div>

      <div className="rounded-2xl border border-earth/8 bg-sand/40 p-5 flex flex-col gap-4">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Mix boxes
        </p>

        <AdminMixBuilder boxes={boxes} mixes={mixes} onChange={setMixes} />

        <input
          type="hidden"
          name="mixes"
          value={JSON.stringify(
            mixes.map((m) => ({
              boxId: m.boxId,
              selections: m.selections,
            })),
          )}
        />
      </div>

      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-4">
        <div>
          <FormLabel htmlFor="notes">
            Notes{" "}
            <span className="normal-case tracking-normal font-light text-earth/40">
              (optional)
            </span>
          </FormLabel>
          <FormTextarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaults.notes}
            placeholder="Any special instructions for delivery…"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-earth/8 bg-white-warm p-5 flex flex-col gap-3">
        <p className="font-body font-semibold uppercase tracking-[0.14em] text-2xs text-earth/40 pt-1">
          Summary
        </p>
        <div className="flex flex-col gap-1.5 font-body text-sm text-earth">
          <div className="flex justify-between">
            <span className="text-earth/60">Subtotal</span>
            <span>{formatAed(subtotal)}</span>
          </div>
          {promotionDiscount > 0 && (
            <div className="flex justify-between text-orange">
              <span>Promotion discount</span>
              <span>− {formatAed(promotionDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-earth/60">
              Delivery
              {delivery.isFreeDelivery && (
                <span className="ml-1 text-moss text-xs">(free)</span>
              )}
            </span>
            <span>{formatAed(delivery.fee)}</span>
          </div>
          {delivery.belowMinimum && delivery.minimumOrder != null && (
            <p className="text-2xs text-red-500">
              Minimum order for {emirate} is {formatAed(delivery.minimumOrder)}
            </p>
          )}
          <div className="border-t border-earth/10 mt-1 pt-2 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatAed(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          as="a"
          href="/panel/all-orders"
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
          {isPending ? "Creating…" : "Create order"}
        </Button>
      </div>
    </form>
  );
}

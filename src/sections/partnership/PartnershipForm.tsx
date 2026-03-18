"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, toastSuccess, toastError } from "@/shared/ui";
import {
  FormLabel,
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTextarea,
  FormError,
} from "@/shared/ui";
import { submitPartnershipInquiry, type PartnershipState } from "./actions";
import { BUSINESS_TYPES } from "./consts";
import { AddressWithMap } from "@/pages_flow/checkout/ui/AddressWithMap";

export function PartnershipForm() {
  const [state, formAction, isPending] = useActionState<
    PartnershipState | null,
    FormData
  >(submitPartnershipInquiry, null);

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) toastSuccess("Partnership inquiry sent!");
    if (state?.error) toastError(state.error);
  }, [state]);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <p className="font-display font-semibold text-earth text-xl">
          Thank you!
        </p>
        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form key={state?.attempt ?? 0} action={formAction} className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="business_name">Business name</FormLabel>
        <FormInput
          id="business_name"
          name="business_name"
          type="text"
          placeholder="Bloom Café"
          defaultValue={state?.values?.business_name}
          state={state?.fieldErrors?.business_name ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.business_name} />
      </div>

      <div>
        <FormLabel htmlFor="contact_name">Contact person</FormLabel>
        <FormInput
          id="contact_name"
          name="contact_name"
          type="text"
          placeholder="Sara Al Mansoori"
          defaultValue={state?.values?.contact_name}
          state={state?.fieldErrors?.contact_name ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.contact_name} />
      </div>

      <div>
        <FormLabel htmlFor="phone">WhatsApp / Phone</FormLabel>
        <FormPhoneInput
          id="phone"
          name="phone"
          defaultValue={state?.values?.phone}
          state={state?.fieldErrors?.phone ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.phone} />
      </div>

      <AddressWithMap
        defaultValue={state?.values?.address}
        defaultLat={state?.values?.lat}
        defaultLng={state?.values?.lng}
      />

      <div>
        <FormLabel htmlFor="business_type">
          Business type{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormSelect
          id="business_type"
          name="business_type"
          defaultValue={state?.values?.business_type ?? ""}
          placeholder="Select type"
          options={BUSINESS_TYPES}
          clearable
        />
      </div>

      <div>
        <FormLabel htmlFor="message">
          Message{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormTextarea
          id="message"
          name="message"
          rows={3}
          placeholder="Tell us about your volumes, delivery area, or any questions..."
          defaultValue={state?.values?.message}
        />
      </div>

      {state?.error && (
        <p className="font-body text-2xs text-red-500">{state.error}</p>
      )}

      <Button
        as="button"
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-1"
        disabled={isPending}
      >
        {isPending ? "Sending…" : "Send Request"}
      </Button>
    </form>
  );
}

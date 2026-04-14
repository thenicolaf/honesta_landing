"use client";

import { useActionState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button, toastSuccess, toastError } from "@/shared/ui";
import {
  FormLabel,
  FormInput,
  FormPhoneInput,
  FormSelect,
  FormTextarea,
  FormError,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import { parseAddress } from "@/shared/utils/address";

const AddressWithMap = dynamic(
  () => import("@/shared/ui/AddressWithMap").then((m) => m.AddressWithMap),
  { ssr: false },
);
import { submitPartnershipInquiry, type PartnershipState } from "./actions";
import { BUSINESS_TYPES } from "./consts";

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
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left column: fields + message */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="business_name">Business name</FormLabel>
              <FormInput
                id="business_name"
                name="business_name"
                type="text"
                placeholder="Your business name"
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
          </div>

          <div className="flex-1 flex flex-col">
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
              className="flex-1"
            />
          </div>
        </div>

        {/* Right column: address with map */}
        <div className="lg:hidden">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full font-body font-semibold text-2xs uppercase tracking-[0.12em] text-earth/50 py-2">
              Add address
              <CollapsibleChevron className="text-earth/40" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AddressWithMap
                {...parseAddress(state?.values?.address)}
                defaultLat={state?.values?.lat}
                defaultLng={state?.values?.lng}
                required={false}
                fieldErrors={{
                  emirate: state?.fieldErrors?.emirate,
                  city: state?.fieldErrors?.addressCity,
                  area: state?.fieldErrors?.addressArea,
                  buildingName: state?.fieldErrors?.addressBuilding,
                }}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="hidden lg:block">
          <AddressWithMap
            {...parseAddress(state?.values?.address)}
            defaultLat={state?.values?.lat}
            defaultLng={state?.values?.lng}
            required={false}
            fieldErrors={{
              emirate: state?.fieldErrors?.emirate,
              city: state?.fieldErrors?.addressCity,
              area: state?.fieldErrors?.addressArea,
              buildingName: state?.fieldErrors?.addressBuilding,
            }}
          />
        </div>
      </div>

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

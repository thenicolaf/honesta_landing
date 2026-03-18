"use client";

import {
  FormLabel,
  FormInput,
  FormPhoneInput,
  FormTextarea,
  FormError,
  AddressWithMap,
} from "@/shared/ui";
import { SubmitButton } from "./SubmitButton";
import { AddressSelector } from "./AddressSelector";
import { CustomerInfo } from "@/shared/types";
import type { CustomerErrors } from "@/shared/utils/validateCustomer";
import { parseAddress } from "@/shared/utils/address";
import type { UserAddress } from "@/lib/addressesDb";

interface CheckoutFormProps {
  defaultValues?: Partial<CustomerInfo>;
  addresses?: UserAddress[];
  fieldErrors?: CustomerErrors;
  totalWithDelivery: number;
}

export function CheckoutForm({
  defaultValues = {},
  addresses,
  fieldErrors,
  totalWithDelivery,
}: CheckoutFormProps) {
  return (
    <>
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={defaultValues.firstName}
            placeholder="Ahmed"
            state={fieldErrors?.firstName ? "error" : "default"}
          />
          <FormError message={fieldErrors?.firstName} />
        </div>
        <div>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <FormInput
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={defaultValues.lastName}
            placeholder="Al Rashid"
            state={fieldErrors?.lastName ? "error" : "default"}
          />
          <FormError message={fieldErrors?.lastName} />
        </div>
      </div>

      {/* Email */}
      <div>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues.email}
          placeholder="you@example.com"
          state={fieldErrors?.email ? "error" : "default"}
        />
        <FormError message={fieldErrors?.email} />
      </div>

      {/* Phone */}
      <div>
        <FormLabel htmlFor="phone">Phone</FormLabel>
        <FormPhoneInput
          id="phone"
          name="phone"
          defaultValue={defaultValues.phone}
          state={fieldErrors?.phone ? "error" : "default"}
        />
        <FormError message={fieldErrors?.phone} />
      </div>

      {/* Address + Map */}
      {addresses && addresses.length > 0 ? (
        <AddressSelector
          addresses={addresses}
          defaultValues={defaultValues}
          error={fieldErrors?.address}
        />
      ) : (
        <AddressWithMap
          {...parseAddress(defaultValues.address)}
          defaultLat={defaultValues.lat}
          defaultLng={defaultValues.lng}
          error={fieldErrors?.address}
        />
      )}

      {/* Notes */}
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
          defaultValue={defaultValues.notes}
          placeholder="Any special instructions for delivery..."
        />
      </div>

      <SubmitButton totalWithDelivery={totalWithDelivery} />

      <p className="font-body font-light text-earth/40 text-xs text-center">
        Payments secured by N-Genius
      </p>
    </>
  );
}

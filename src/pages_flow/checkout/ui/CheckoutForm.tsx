"use client";

import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormError,
} from "@/shared/ui";
import { SubmitButton } from "./SubmitButton";
import { CustomerInfo } from "@/shared/types";
import type { CustomerErrors } from "@/shared/utils/validateCustomer";

const DUBAI_DISTRICTS = [
  "JBR",
  "Marina",
  "Palm Jumeirah",
  "Downtown Dubai",
  "Business Bay",
  "DIFC",
  "Jumeirah",
  "Al Barsha",
  "Dubai Hills",
  "Mirdif",
  "JLT",
  "Sports City",
  "Motor City",
  "Arabian Ranches",
  "Deira",
  "Bur Dubai",
  "Discovery Gardens",
  "International City",
];

interface CheckoutFormProps {
  defaultValues?: Partial<CustomerInfo>;
  error?: string | null;
  fieldErrors?: CustomerErrors;
  totalWithDelivery: number;
}

export function CheckoutForm({
  defaultValues = {},
  error,
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
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultValues.phone}
          placeholder="+971500000000"
          title="Format: +971XXXXXXXXX"
          state={fieldErrors?.phone ? "error" : "default"}
        />
        {fieldErrors?.phone ? (
          <FormError message={fieldErrors.phone} />
        ) : (
          <p className="font-body font-light text-earth/40 text-xs mt-1">
            Format: +971XXXXXXXXX
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <FormLabel htmlFor="address">Delivery Address</FormLabel>
        <FormInput
          id="address"
          name="address"
          type="text"
          defaultValue={defaultValues.address}
          placeholder="Street, building, apartment"
          state={fieldErrors?.address ? "error" : "default"}
        />
        <FormError message={fieldErrors?.address} />
      </div>

      {/* District */}
      <div>
        <FormLabel htmlFor="district">District</FormLabel>
        <FormSelect
          id="district"
          name="district"
          defaultValue={defaultValues.district ?? ""}
          state={fieldErrors?.district ? "error" : "default"}
        >
          <option value="" disabled>
            Select your district
          </option>
          {DUBAI_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </FormSelect>
        <FormError message={fieldErrors?.district} />
      </div>

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

      {error && (
        <p className="font-body text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <SubmitButton totalWithDelivery={totalWithDelivery} />

      <p className="font-body font-light text-earth/40 text-xs text-center">
        Payments secured by N-Genius
      </p>
    </>
  );
}

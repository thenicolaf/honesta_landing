"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormError, Button } from "@/shared/ui";
import { IconCheckCircle } from "@/shared/icons";
import { AddressWithMap } from "@/pages_flow/checkout/ui/AddressWithMap";
import { updateProfile, type ProfileState } from "./actions";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface ProfileFormProps {
  defaultValues?: ProfileData | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="md"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [state, action] = useActionState<ProfileState | null, FormData>(
    updateProfile,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={state?.values?.firstName ?? defaultValues?.first_name ?? undefined}
            placeholder="Ahmed"
            state={state?.fieldErrors?.firstName ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.firstName} />
        </div>
        <div>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <FormInput
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={state?.values?.lastName ?? defaultValues?.last_name ?? undefined}
            placeholder="Al Rashid"
            state={state?.fieldErrors?.lastName ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.lastName} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <FormLabel htmlFor="phone">Phone</FormLabel>
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          defaultValue={state?.values?.phone ?? defaultValues?.phone ?? undefined}
          placeholder="+971500000000"
          title="Format: +971XXXXXXXXX"
          state={state?.fieldErrors?.phone ? "error" : "default"}
        />
        {state?.fieldErrors?.phone ? (
          <FormError message={state.fieldErrors.phone} />
        ) : (
          <p className="font-body font-light text-earth/40 text-xs mt-1">
            Format: +971XXXXXXXXX
          </p>
        )}
      </div>

      {/* Address + Map */}
      <AddressWithMap
        defaultValue={state?.values?.address ?? defaultValues?.address ?? undefined}
        defaultLat={state?.values?.lat ?? defaultValues?.coordinates?.lat?.toString()}
        defaultLng={state?.values?.lng ?? defaultValues?.coordinates?.lng?.toString()}
        error={state?.fieldErrors?.address}
      />

      {/* General error */}
      {state?.error && (
        <p className="font-body text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      {/* Success */}
      {state?.success && (
        <div className="flex items-center gap-2 text-moss font-body text-sm bg-moss/10 border border-moss/20 rounded-xl px-4 py-3">
          <IconCheckCircle className="w-4 h-4 shrink-0" aria-hidden />
          Profile updated successfully
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormPhoneInput, FormError, Button, toastSuccess, toastError } from "@/shared/ui";
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
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) toastSuccess("Profile updated");
    if (state?.error) toastError(state.error);
  }, [state]);

  return (
    <form key={state?.attempt ?? 0} action={action} className="flex flex-col gap-5">
      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 min-[26.25rem]:grid-cols-2">
        <div>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={
              state?.values?.firstName ?? defaultValues?.first_name ?? undefined
            }
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
            defaultValue={
              state?.values?.lastName ?? defaultValues?.last_name ?? undefined
            }
            placeholder="Al Rashid"
            state={state?.fieldErrors?.lastName ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.lastName} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <FormLabel htmlFor="phone">Phone</FormLabel>
        <FormPhoneInput
          id="phone"
          name="phone"
          defaultValue={
            state?.values?.phone ?? defaultValues?.phone ?? undefined
          }
          state={state?.fieldErrors?.phone ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.phone} />
      </div>

      {/* Address + Map */}
      <AddressWithMap
        defaultValue={
          state?.values?.address ?? defaultValues?.address ?? undefined
        }
        defaultLat={
          state?.values?.lat ?? defaultValues?.coordinates?.lat?.toString()
        }
        defaultLng={
          state?.values?.lng ?? defaultValues?.coordinates?.lng?.toString()
        }
        error={state?.fieldErrors?.address}
      />

      <SubmitButton />
    </form>
  );
}

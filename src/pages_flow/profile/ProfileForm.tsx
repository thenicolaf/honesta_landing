"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormPhoneInput, FormTileRadio, FormTileRadioItem, FormDatePicker, FormError, Button, toastSuccess, toastError } from "@/shared/ui";
import { updateProfile, type ProfileState } from "./actions";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
}

interface ProfileFormProps {
  defaultValues?: ProfileData | null;
  onDone?: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      as="button"
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
    >
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ defaultValues, onDone }: ProfileFormProps) {
  const [state, action] = useActionState<ProfileState | null, FormData>(
    updateProfile,
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess("Profile updated");
      onDone?.();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state, onDone]);

  return (
    <form action={action} className="flex flex-col gap-5">
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

      {/* Gender & Birthday */}
      <div className="grid grid-cols-1 gap-4 min-[26.25rem]:grid-cols-2">
        <div>
          <FormLabel>Gender</FormLabel>
          <FormTileRadio
            name="gender"
            defaultValue={
              state?.values?.gender ?? defaultValues?.gender ?? ""
            }
          >
            <FormTileRadioItem value="male">Male</FormTileRadioItem>
            <FormTileRadioItem value="female">Female</FormTileRadioItem>
          </FormTileRadio>
        </div>
        <div>
          <FormLabel htmlFor="birthday">Birthday</FormLabel>
          <FormDatePicker
            id="birthday"
            name="birthday"
            defaultValue={
              (state?.values?.birthday ?? defaultValues?.birthday)
                ? new Date((state?.values?.birthday ?? defaultValues?.birthday)! + "T00:00:00")
                : undefined
            }
            placeholder="Select your birthday"
            clearable
            minDate={new Date(new Date().getFullYear() - 120, 0, 1)}
            maxDate={new Date()}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onDone && (
          <Button
            as="button"
            type="button"
            variant="secondary"
            size="sm"
            onClick={onDone}
          >
            Cancel
          </Button>
        )}
        <SubmitButton />
      </div>
    </form>
  );
}

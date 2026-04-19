"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  FormLabel,
  FormPasswordInput,
  FormError,
  Button,
  toastSuccess,
  toastError,
} from "@/shared/ui";

import { changePassword, type ChangePasswordState } from "./actions";

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
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

interface ChangePasswordFormProps {
  onDone?: () => void;
}

export function ChangePasswordForm({ onDone }: ChangePasswordFormProps) {
  const [state, action] = useActionState<ChangePasswordState | null, FormData>(
    changePassword,
    null,
  );

  const prevState = useRef(state);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) {
      toastSuccess("Password updated");
      formRef.current?.reset();
      onDone?.();
    }
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      <div>
        <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
        <FormPasswordInput
          id="currentPassword"
          name="currentPassword"
          placeholder="••••••••"
          defaultValue={state?.values?.currentPassword}
          autoComplete="current-password"
          state={state?.fieldErrors?.currentPassword ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.currentPassword} />
      </div>

      <div>
        <FormLabel htmlFor="newPassword">New Password</FormLabel>
        <FormPasswordInput
          id="newPassword"
          name="newPassword"
          placeholder="••••••••"
          defaultValue={state?.values?.newPassword}
          autoComplete="new-password"
          state={state?.fieldErrors?.newPassword ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.newPassword} />
        {!state?.fieldErrors?.newPassword && (
          <p className="font-body font-light text-earth/40 text-xs mt-1">
            At least 6 characters
          </p>
        )}
      </div>

      <div>
        <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
        <FormPasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          defaultValue={state?.values?.confirmPassword}
          autoComplete="new-password"
          state={state?.fieldErrors?.confirmPassword ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.confirmPassword} />
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

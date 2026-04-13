"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormPasswordInput, FormError, Button, toastError } from "@/shared/ui";
import { signUp, type SignupState } from "./actions";

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
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, action] = useActionState<SignupState | null, FormData>(
    signUp,
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
    if (state?.fieldErrors) toastError("Please fill in the required fields");
  }, [state]);

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 min-[26.25rem]:grid-cols-2">
        <div>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Ahmed"
            defaultValue={state?.values?.firstName}
            autoComplete="given-name"
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
            placeholder="Al Rashid"
            defaultValue={state?.values?.lastName}
            autoComplete="family-name"
            state={state?.fieldErrors?.lastName ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="email" required>Email</FormLabel>
        <FormInput
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          defaultValue={state?.values?.email}
          autoComplete="email"
          state={state?.fieldErrors?.email ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.email} />
      </div>

      <div>
        <FormLabel htmlFor="password" required>Password</FormLabel>
        <FormPasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          defaultValue={state?.values?.password}
          autoComplete="new-password"
          state={state?.fieldErrors?.password ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.password} />
        {!state?.fieldErrors?.password && (
          <p className="font-body font-light text-earth/40 text-xs mt-1">
            At least 6 characters
          </p>
        )}
      </div>

      <div>
        <FormLabel htmlFor="confirmPassword" required>Confirm Password</FormLabel>
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

      <SubmitButton />
    </form>
  );
}

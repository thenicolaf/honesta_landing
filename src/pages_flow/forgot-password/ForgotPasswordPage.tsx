"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormError, Button, Card, toastError } from "@/shared/ui";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

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
      {pending ? "Sending..." : "Send Reset Code"}
    </Button>
  );
}

export function ForgotPasswordPage() {
  const [state, action] = useActionState<ForgotPasswordState | null, FormData>(
    requestPasswordReset,
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
  }, [state]);

  return (
    <Card className="p-8">
      <p className="font-body font-light text-earth text-sm text-center mb-6">
        Enter your email address and we&apos;ll send you a code to reset your password.
      </p>

      <form key={state?.attempt ?? 0} action={action} noValidate className="flex flex-col gap-4">
        <div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            state={state?.fieldErrors?.email ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.email} />
        </div>

        <SubmitButton />
      </form>

      <p className="text-center mt-6 font-body font-light text-sm text-earth/60">
        Remember your password?{" "}
        <Button
          href="/login"
          variant="text"
          size="inline"
          className="text-orange font-medium"
        >
          Sign in
        </Button>
      </p>
    </Card>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { FormLabel, FormInput, FormPasswordInput, FormError, Button, toastError } from "@/shared/ui";
import { signIn, type LoginState } from "./actions";

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
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<LoginState | null, FormData>(
    signIn.bind(null, next),
    null,
  );

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
  }, [state]);

  return (
    <form key={state?.attempt ?? 0} action={action} noValidate className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={state?.values?.email}
          state={state?.fieldErrors?.email ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.email} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <FormLabel htmlFor="password" className="mb-0">Password</FormLabel>
          <Button
            href="/forgot-password"
            variant="text"
            size="inline"
            className="text-orange font-medium text-xs"
          >
            Forgot password?
          </Button>
        </div>
        <FormPasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          defaultValue={state?.values?.password}
          state={state?.fieldErrors?.password ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.password} />
      </div>

      <SubmitButton />
    </form>
  );
}

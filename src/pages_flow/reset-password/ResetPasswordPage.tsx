"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FormLabel,
  FormPasswordInput,
  FormError,
  FormOtpInput,
  useResendCooldown,
  Button,
  Card,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { resetPassword, type ResetPasswordState } from "./actions";

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
      {pending ? "Resetting..." : "Reset Password"}
    </Button>
  );
}

export function ResetPasswordPage({ email }: { email: string }) {
  const [state, action] = useActionState<ResetPasswordState | null, FormData>(
    resetPassword.bind(null, email),
    null,
  );
  const [otpValue, setOtpValue] = useState("");

  const prevState = useRef(state);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.error) toastError(state.error);
  }, [state]);

  const { cooldown, startCooldown } = useResendCooldown();

  async function handleResend() {
    if (cooldown > 0) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toastError("Failed to resend code. Please try again.");
    } else {
      toastSuccess("A new code has been sent to your email.");
      startCooldown();
    }
  }

  return (
    <Card className="p-8">
      <p className="font-body font-light text-earth text-sm text-center mb-6">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium">{email}</span>{" "}
        and choose a new password.
      </p>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="otp" value={otpValue} />

        <div>
          <FormLabel htmlFor="otp-label">Verification Code</FormLabel>
          <FormOtpInput defaultValue={state?.values?.otp} onComplete={setOtpValue} />
          <FormError message={state?.fieldErrors?.otp} />
        </div>

        <div>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <FormPasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            autoComplete="new-password"
            defaultValue={state?.values?.password}
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
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <FormPasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            defaultValue={state?.values?.confirmPassword}
            state={state?.fieldErrors?.confirmPassword ? "error" : "default"}
          />
          <FormError message={state?.fieldErrors?.confirmPassword} />
        </div>

        <SubmitButton />
      </form>

      <div className="text-center mt-6">
        <p className="font-body font-light text-2xs text-earth/40 mb-1">
          Didn&apos;t receive the code?
        </p>
        <Button
          as="button"
          variant="text"
          size="inline"
          className="text-orange font-medium"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </Button>
      </div>
    </Card>
  );
}

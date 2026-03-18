"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  Card,
  FormOtpInput,
  useResendCooldown,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { verifyOtp, type VerifyState } from "./actions";

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
      {pending ? "Verifying..." : "Verify"}
    </Button>
  );
}

export function VerifyEmailPage({ email }: { email: string }) {
  const [otpValue, setOtpValue] = useState("");
  const [state, action] = useActionState<VerifyState | null, FormData>(
    verifyOtp.bind(null, email),
    null,
  );

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
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
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
        We sent a 6-digit code to{" "}
        <span className="font-medium">{email}</span>
      </p>

      <form key={state?.attempt ?? 0} action={action} className="flex flex-col gap-5">
        <input type="hidden" name="otp" value={otpValue} />
        <FormOtpInput onComplete={setOtpValue} />
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

"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import {
  validateResetPassword,
  type ResetPasswordErrors,
} from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResetValues {
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordState {
  error?: string;
  fieldErrors?: ResetPasswordErrors & { otp?: string };
  values?: { otp: string; password: string; confirmPassword: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseResetValues(formData: FormData): ResetValues {
  return {
    otp: (formData.get("otp") as string)?.trim(),
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
}

function isValidOtp(token: string): boolean {
  return /^\d{6}$/.test(token);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function resetPassword(
  email: string,
  _prevState: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const { otp, password, confirmPassword } = parseResetValues(formData);
  const values = { otp, password, confirmPassword };

  const fieldErrors: ResetPasswordState["fieldErrors"] = {};

  if (!otp || !isValidOtp(otp)) {
    fieldErrors.otp = "Please enter a valid 6-digit code.";
  }

  const passwordErrors = validateResetPassword({ password, confirmPassword });
  if (passwordErrors) {
    Object.assign(fieldErrors, passwordErrors);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();

  // Verify the recovery OTP — this also creates a session
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });

  if (verifyError) {
    return {
      error: "Invalid or expired code. Please try again.",
      values,
    };
  }

  // Update the password (session is active after verifyOtp)
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    return {
      error: "Failed to update password. Please try again.",
      values,
    };
  }

  redirect("/");
}

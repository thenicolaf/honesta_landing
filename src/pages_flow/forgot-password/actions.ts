"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase.server";
import { validateEmail } from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForgotPasswordState {
  error?: string;
  fieldErrors?: { email?: string };
  values?: { email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseEmail(formData: FormData): string {
  return (formData.get("email") as string)?.trim();
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function requestPasswordReset(
  _prevState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = parseEmail(formData);

  const emailError = validateEmail(email);
  if (emailError) {
    return { fieldErrors: { email: emailError }, values: { email } };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: "Something went wrong. Please try again.", values: { email } };
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

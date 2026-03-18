"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase.server";
import { validateEmail } from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForgotPasswordState {
  error?: string;
  fieldErrors?: { email?: string };
  attempt?: number;
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
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const emailError = validateEmail(email);
  if (emailError) {
    return { fieldErrors: { email: emailError }, attempt };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: "Something went wrong. Please try again.", attempt };
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

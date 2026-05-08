"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { withGAEvent } from "@/shared/utils/analyticsParams";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerifyState {
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseOtp(formData: FormData): string {
  return (formData.get("otp") as string)?.trim();
}

function isValidOtp(token: string): boolean {
  return /^\d{6}$/.test(token);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function verifyOtp(
  email: string,
  _prevState: VerifyState | null,
  formData: FormData,
): Promise<VerifyState> {
  const token = parseOtp(formData);

  if (!token || !isValidOtp(token)) {
    return { error: "Please enter a valid 6-digit code." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { error: "Invalid or expired code. Please try again." };
    }

    redirect(withGAEvent("/", "sign_up", "email"));
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("Verify email error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

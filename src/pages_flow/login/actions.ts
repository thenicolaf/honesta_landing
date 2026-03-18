"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import {
  validateLogin,
  type LoginErrors,
} from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginValues {
  email: string;
  password: string;
}

export interface LoginState {
  error?: string;
  fieldErrors?: LoginErrors;
  values?: { email: string; password: string };
  attempt?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLoginValues(formData: FormData): LoginValues {
  return {
    email: (formData.get("email") as string)?.trim(),
    password: formData.get("password") as string,
  };
}

function mapAuthError(message: string): string {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for a verification code.";
  }
  return "Invalid email or password.";
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function signIn(
  next: string,
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const { email, password } = parseLoginValues(formData);
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const values = { email, password };

  const fieldErrors = validateLogin({ email, password });
  if (fieldErrors) {
    return { fieldErrors, values, attempt };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error.message), values, attempt };
  }

  redirect(next.startsWith("/") ? next : "/");
}

"use server";

import { redirect } from "next/navigation";
import { supabase, supabaseAdmin } from "@/lib/supabase.server";
import { validateSignup, type SignupErrors } from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignupValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupState {
  error?: string;
  fieldErrors?: SignupErrors;
  values?: Partial<SignupValues>;
  attempt?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSignupValues(formData: FormData): SignupValues {
  return {
    firstName: (formData.get("firstName") as string)?.trim(),
    lastName: (formData.get("lastName") as string)?.trim(),
    email: (formData.get("email") as string)?.trim(),
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
}

function mapSignupError(message: string): string {
  if (message.toLowerCase().includes("already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  return "Something went wrong. Please try again.";
}

async function createProfile(
  userId: string,
  firstName: string,
  lastName: string,
) {
  const { error } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    updated_at: new Date().toISOString(),
  });
  return error;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function signUp(
  _prevState: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const values = parseSignupValues(formData);
  const { firstName, lastName, email, password, confirmPassword } = values;
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const fieldErrors = validateSignup({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });
  if (fieldErrors) {
    return { fieldErrors, values, attempt };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) {
    return { error: mapSignupError(error.message), values, attempt };
  }

  if (data.user) {
    const profileError = await createProfile(data.user.id, firstName, lastName);
    if (profileError) {
      return {
        error:
          "Account created but profile setup failed. Please update your profile later.",
        values,
        attempt,
      };
    }
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

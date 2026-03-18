"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import type { ProfileInfo } from "@/shared/types";
import {
  validateProfile,
  type ProfileErrors,
} from "@/shared/utils/validateProfile";
import {
  validateChangePassword,
  type ChangePasswordErrors,
} from "@/shared/utils/validateAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileState {
  success?: boolean;
  error?: string;
  fieldErrors?: ProfileErrors;
  values?: Partial<ProfileInfo>;
  attempt?: number;
}

export interface ChangePasswordState {
  success?: boolean;
  error?: string;
  fieldErrors?: ChangePasswordErrors;
  values?: Partial<ChangePasswordValues>;
  attempt?: number;
}

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseChangePasswordValues(formData: FormData): ChangePasswordValues {
  return {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(
  _prevState: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const profile = Object.fromEntries(formData) as Partial<ProfileInfo>;
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const fieldErrors = validateProfile(profile);
  if (fieldErrors) {
    return { fieldErrors, values: profile, attempt };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: profile.firstName!.trim(),
    last_name: profile.lastName!.trim(),
    phone: profile.phone!.trim(),
    gender: profile.gender || null,
    birthday: profile.birthday || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Failed to save profile. Please try again.", values: profile, attempt };
  }

  return { success: true, values: profile, attempt };
}

export async function changePassword(
  _prevState: ChangePasswordState | null,
  formData: FormData,
): Promise<ChangePasswordState> {
  const values = parseChangePasswordValues(formData);
  const attempt = (_prevState?.attempt ?? 0) + 1;

  const fieldErrors = validateChangePassword(values);
  if (fieldErrors) {
    return { fieldErrors, values, attempt };
  }

  const { supabase, user } = await requireUser();

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: values.currentPassword,
  });
  if (signInError) {
    return { error: "Current password is incorrect.", values, attempt };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: values.newPassword,
  });
  if (updateError) {
    return { error: "Failed to update password. Please try again.", values, attempt };
  }

  return { success: true, attempt };
}

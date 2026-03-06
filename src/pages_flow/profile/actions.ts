"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import type { ProfileInfo } from "@/shared/types";
import {
  validateProfile,
  type ProfileErrors,
} from "@/shared/utils/validateProfile";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export interface ProfileState {
  success?: boolean;
  error?: string;
  fieldErrors?: ProfileErrors;
  values?: Partial<ProfileInfo>;
}

export async function updateProfile(
  _prevState: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const profile = Object.fromEntries(formData) as Partial<ProfileInfo>;

  const fieldErrors = validateProfile(profile);
  if (fieldErrors) {
    return { fieldErrors, values: profile };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const lat = parseFloat(profile.lat ?? "");
  const lng = parseFloat(profile.lng ?? "");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    first_name: profile.firstName!.trim(),
    last_name: profile.lastName!.trim(),
    phone: profile.phone!.trim(),
    address: profile.address!.trim(),
    coordinates: !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "Failed to save profile. Please try again.", values: profile };
  }

  return { success: true, values: profile };
}

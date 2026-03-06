import type { ProfileInfo } from "@/shared/types";

export type ProfileErrors = Partial<Record<keyof ProfileInfo, string>>;

export function validateProfile(
  profile: Partial<ProfileInfo>,
): ProfileErrors | null {
  const errors: ProfileErrors = {};

  if (!profile.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }
  if (!profile.lastName?.trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!profile.phone?.trim()) {
    errors.phone = "Phone is required.";
  } else if (!/^\+971[0-9]{9}$/.test(profile.phone)) {
    errors.phone =
      "Phone must start with +971 followed by 9 digits (e.g. +971501234567).";
  }
  if (!profile.address?.trim()) {
    errors.address = "Address is required.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

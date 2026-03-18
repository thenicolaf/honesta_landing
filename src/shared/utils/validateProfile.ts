import type { ProfileInfo } from "@/shared/types";
import { validatePhone } from "./validatePhone";

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
  const phoneError = validatePhone(profile.phone);
  if (phoneError) errors.phone = phoneError;
  if (!profile.address?.trim()) {
    errors.address = "Address is required.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

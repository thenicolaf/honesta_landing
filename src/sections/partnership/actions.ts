"use server";

import { supabaseAdmin } from "@/lib/supabase.server";
import {
  validatePartnership,
  type PartnershipInquiry,
  type PartnershipErrors,
} from "@/shared/utils/validatePartnership";

export interface PartnershipState {
  success?: true;
  error?: string;
  fieldErrors?: PartnershipErrors;
  values?: Partial<PartnershipInquiry>;
  attempt?: number;
}

export async function submitPartnershipInquiry(
  prevState: PartnershipState | null,
  formData: FormData,
): Promise<PartnershipState | null> {
  const data = Object.fromEntries(formData) as Partial<PartnershipInquiry>;
  const attempt = (prevState?.attempt ?? 0) + 1;

  const fieldErrors = validatePartnership(data);
  if (fieldErrors) {
    return { fieldErrors, values: data, attempt };
  }

  const { error } = await supabaseAdmin.from("partnership_inquiries").insert({
    business_name: data.business_name!.trim(),
    contact_name: data.contact_name!.trim(),
    phone: data.phone!.trim(),
    business_type: data.business_type?.trim() || null,
    message: data.message?.trim() || null,
  });

  if (error) {
    console.error("Partnership inquiry insert error:", error);
    return {
      error:
        "Something went wrong. Please try again or message us on Instagram.",
      values: data,
      attempt,
    };
  }

  return { success: true };
}

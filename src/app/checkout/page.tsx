import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order for natural dried fruits delivery in UAE.",
};
import { CheckoutPage } from "@/pages_flow/checkout";
import { CUSTOMER_COOKIE_KEY } from "@/shared/consts";
import { CustomerInfo } from "@/shared/types";
import { createSupabaseServerClient } from "@/lib/supabase.server";

export default async function CheckoutRoute() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_COOKIE_KEY)?.value;
  let cookieValues: Partial<CustomerInfo> = {};
  if (raw) {
    try {
      cookieValues = JSON.parse(raw) as CustomerInfo;
    } catch {
      // ignore malformed cookie
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileValues: Partial<CustomerInfo> = {};
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, address, coordinates")
      .eq("id", user.id)
      .single();

    if (profile?.first_name) {
      profileValues.firstName = profile.first_name;
    }
    if (profile?.last_name) {
      profileValues.lastName = profile.last_name;
    }
    if (profile?.phone) {
      profileValues.phone = profile.phone;
    }
    if (profile?.address) {
      profileValues.address = profile.address;
    }

    const coords = profile?.coordinates as { lat: number; lng: number } | null;
    if (coords) {
      profileValues.lat = String(coords.lat);
      profileValues.lng = String(coords.lng);
    }

    if (user.email) {
      profileValues.email = user.email;
    }
  }

  return <CheckoutPage defaultValues={user ? profileValues : cookieValues} />;
}

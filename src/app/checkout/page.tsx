import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order for natural dried fruits delivery in UAE.",
  robots: { index: false, follow: false },
};
import { CheckoutPage } from "@/pages_flow/checkout";
import { CUSTOMER_COOKIE_KEY } from "@/shared/consts";
import { CustomerInfo } from "@/shared/types";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { getUserAddresses } from "@/lib/addressesDb";
import { getDeliverySettings } from "@/lib/deliveryDb";

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
  let addresses: Awaited<ReturnType<typeof getUserAddresses>> = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .single();

    if (profile?.first_name) profileValues.firstName = profile.first_name;
    if (profile?.last_name) profileValues.lastName = profile.last_name;
    if (profile?.phone) profileValues.phone = profile.phone;
    if (user.email) profileValues.email = user.email;

    addresses = await getUserAddresses(user.id);
  }

  const deliverySettings = await getDeliverySettings();

  return (
    <CheckoutPage
      defaultValues={user ? profileValues : cookieValues}
      addresses={addresses}
      deliverySettings={deliverySettings}
    />
  );
}

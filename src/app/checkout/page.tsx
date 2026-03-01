import { cookies } from "next/headers";
import { CheckoutPage } from "@/pages_flow/checkout";
import { CUSTOMER_COOKIE_KEY } from "@/shared/consts";
import { CustomerInfo } from "@/shared/types";

export default async function CheckoutRoute() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_COOKIE_KEY)?.value;
  let defaultValues: Partial<CustomerInfo> = {};
  if (raw) {
    try {
      defaultValues = JSON.parse(raw) as CustomerInfo;
    } catch {
      // ignore malformed cookie
    }
  }

  return <CheckoutPage defaultValues={defaultValues} />;
}

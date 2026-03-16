import { supabaseAdmin } from "@/lib/supabase.server";
import { AllOrdersPage } from "@/pages_flow/panel/orders/AllOrdersPage";

export default async function Page() {
  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return <AllOrdersPage orders={ordersData ?? []} />;
}

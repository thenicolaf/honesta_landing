import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase.server";
import { OrdersPage } from "@/pages_flow/orders/OrdersPage";

export default async function Page() {
  const supabaseServer = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <OrdersPage orders={ordersData ?? []} />;
}

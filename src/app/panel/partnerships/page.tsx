import { supabaseAdmin } from "@/lib/supabase.server";
import { PartnershipsPage } from "@/pages_flow/panel/partnerships/PartnershipsPage";

export default async function Page() {
  const { data } = await supabaseAdmin
    .from("partnership_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <PartnershipsPage inquiries={data ?? []} />;
}

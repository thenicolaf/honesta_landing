import { createSupabaseServerClient } from "@/lib/supabase.server";
import { ProfilePage } from "@/pages_flow/profile/ProfilePage";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, address, coordinates")
    .eq("id", user!.id)
    .single();

  const provider = user?.app_metadata?.provider ?? "email";

  return <ProfilePage profile={profile} provider={provider} />;
}

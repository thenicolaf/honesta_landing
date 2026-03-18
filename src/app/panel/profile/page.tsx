import { createSupabaseServerClient } from "@/lib/supabase.server";
import { ProfilePage } from "@/pages_flow/profile/ProfilePage";
import { getUserAddresses } from "@/lib/addressesDb";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", user!.id)
    .single();

  const addresses = await getUserAddresses(user!.id);
  const provider = user?.app_metadata?.provider ?? "email";

  return <ProfilePage profile={profile} addresses={addresses} provider={provider} />;
}

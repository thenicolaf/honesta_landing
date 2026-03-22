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
    .select("first_name, last_name, phone, gender, birthday, role, allow_notifications")
    .eq("id", user!.id)
    .single();

  const addresses = await getUserAddresses(user!.id);
  const provider = user?.app_metadata?.provider ?? "email";

  return (
    <ProfilePage
      profile={profile}
      addresses={addresses}
      provider={provider}
      role={profile?.role}
      allowNotifications={profile?.allow_notifications ?? true}
    />
  );
}

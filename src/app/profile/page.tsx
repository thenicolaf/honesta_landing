import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { ProfilePage } from "@/pages_flow/profile/ProfilePage";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, address, coordinates")
    .eq("id", user.id)
    .single();

  return <ProfilePage email={user.email!} profile={profile} />;
}

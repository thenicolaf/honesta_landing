import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { ProfilePage } from "@/pages_flow/profile/ProfilePage";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ProfilePage email={user.email!} />;
}

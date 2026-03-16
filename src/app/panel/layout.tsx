import { createSupabaseServerClient } from "@/lib/supabase.server";
import { AdminSidebar } from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  return (
    <main className="grow min-h-160 bg-cream pt-24 pb-12 md:pb-16">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center px-4 md:px-6 lg:px-10">
        <AdminSidebar
          email={user?.email ?? ""}
          isAdmin={profile?.role === "admin"}
        />
        <div className="flex-1 min-w-0 w-full max-w-7xl">{children}</div>
      </div>
    </main>
  );
}

import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { getUserAddresses } from "@/lib/addressesDb";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton, Card } from "@/shared/ui";
import { ProfileSection } from "@/pages_flow/profile/ProfileSection";
import { PasswordSection } from "@/pages_flow/profile/PasswordSection";
import { AddressSection } from "@/pages_flow/profile/AddressSection";
import { NotificationSettingsSection } from "@/pages_flow/profile/NotificationSettingsSection";
import { PushNotificationSection } from "@/pages_flow/profile/PushNotificationSection";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile card */}
      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Address card */}
      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>

      {/* Notifications card */}
      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      </Card>

      {/* Password card */}
      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </Card>
    </div>
  );
}

async function ProfileContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, addresses] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, phone, gender, birthday, role, allow_notifications")
      .eq("id", user!.id)
      .single(),
    getUserAddresses(user!.id),
  ]);

  const provider = user?.app_metadata?.provider ?? "email";

  return (
    <>
      <ProfileSection profile={profile} />

      <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
        <AddressSection addresses={addresses} />
      </Card>

      {profile?.role !== "admin" && (
        <NotificationSettingsSection defaultChecked={profile?.allow_notifications ?? true} />
      )}

      <PushNotificationSection />

      {provider === "email" && <PasswordSection />}
    </>
  );
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Profile" />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </>
  );
}

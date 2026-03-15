import { Card } from "@/shared/ui";
import { ProfileForm } from "./ProfileForm";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface ProfilePageProps {
  profile: ProfileData | null;
}

export function ProfilePage({ profile }: ProfilePageProps) {
  return (
    <>
      <AdminPageHeader title="Profile" />

      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-6">
          Personal Information
        </p>
        <ProfileForm defaultValues={profile} />
      </Card>
    </>
  );
}

import { Card } from "@/shared/ui";
import { ProfileSection } from "./ProfileSection";
import { PasswordSection } from "./PasswordSection";
import { AddressSection } from "./AddressSection";
import { NotificationSettingsSection } from "./NotificationSettingsSection";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import type { UserAddress } from "@/lib/addressesDb";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
}

interface ProfilePageProps {
  profile: ProfileData | null;
  addresses: UserAddress[];
  provider?: string;
  role?: string;
  allowNotifications?: boolean;
}

export function ProfilePage({ profile, addresses, provider, role, allowNotifications }: ProfilePageProps) {
  return (
    <>
      <AdminPageHeader title="Profile" />

      <ProfileSection profile={profile} />

      <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
        <AddressSection addresses={addresses} />
      </Card>

      {role !== "admin" && (
        <NotificationSettingsSection defaultChecked={allowNotifications ?? true} />
      )}

      {provider === "email" && <PasswordSection />}
    </>
  );
}

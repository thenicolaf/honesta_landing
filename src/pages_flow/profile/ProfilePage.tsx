import { Card } from "@/shared/ui";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AddressSection } from "./AddressSection";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import type { UserAddress } from "@/lib/addressesDb";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

interface ProfilePageProps {
  profile: ProfileData | null;
  addresses: UserAddress[];
  provider?: string;
}

export function ProfilePage({ profile, addresses, provider }: ProfilePageProps) {
  return (
    <>
      <AdminPageHeader title="Profile" />

      <Card className="p-4 md:px-6 md:py-4 lg:p-8">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-6">
          Personal Information
        </p>
        <ProfileForm defaultValues={profile} />
      </Card>

      <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
        <AddressSection addresses={addresses} />
      </Card>

      {provider === "email" && (
        <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
          <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-6">
            Change Password
          </p>
          <ChangePasswordForm />
        </Card>
      )}
    </>
  );
}

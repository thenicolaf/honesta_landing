"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, User, Phone, Users, Cake } from "lucide-react";
import { Card, Button } from "@/shared/ui";
import { ProfileForm } from "./ProfileForm";
import { formatPhoneDisplay } from "@/shared/utils/validatePhone";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-sand/60 p-2 text-earth/40 shrink-0 [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/40">
          {label}
        </p>
        <p className="font-body text-sm text-earth truncate">
          {value || <span className="text-earth/30 italic">Not set</span>}
        </p>
      </div>
    </div>
  );
}

export function ProfileSection({ profile }: { profile: ProfileData | null }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");

  const phoneDisplay = profile?.phone
    ? formatPhoneDisplay(profile.phone)
    : null;

  const genderDisplay = profile?.gender
    ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
    : null;

  const birthdayDisplay = profile?.birthday
    ? new Date(profile.birthday).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card className="p-4 md:px-6 md:py-4 lg:p-8 overflow-visible">
      <div className="flex items-center justify-between mb-6">
        <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50">
          Personal Information
        </p>
        {!editing && (
          <Button
            as="button"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <ProfileForm
          defaultValues={profile}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField
            icon={<User />}
            label="Full Name"
            value={fullName || null}
          />
          <ProfileField icon={<Phone />} label="Phone" value={phoneDisplay} />
          <ProfileField icon={<Users />} label="Gender" value={genderDisplay} />
          <ProfileField icon={<Cake />} label="Birthday" value={birthdayDisplay} />
        </div>
      )}
    </Card>
  );
}

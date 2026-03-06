import { Card, Button, Avatar } from "@/shared/ui";
import { signOut } from "./actions";
import { ProfileForm } from "./ProfileForm";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface ProfilePageProps {
  email: string;
  profile: ProfileData | null;
}

export function ProfilePage({ email, profile }: ProfilePageProps) {
  const displayInitial = profile?.first_name ?? email;
  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : null;

  return (
    <main className="grow bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24">
            <Card className="flex flex-col p-0 overflow-hidden min-h-80">
              {/* User info */}
              <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
                <Avatar initial={displayInitial} size="lg" />
                {displayName && (
                  <p className="font-body font-semibold text-earth text-sm text-center">
                    {displayName}
                  </p>
                )}
                <p className="font-body font-light text-earth/50 text-xs text-center break-all">
                  {email}
                </p>
              </div>

              {/* Nav */}
              <nav className="flex flex-col px-3 pb-3">
                <a
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-body font-semibold text-xs uppercase tracking-widest text-orange bg-orange/8 transition-colors"
                >
                  Personal Info
                </a>
              </nav>

              {/* Separator + logout */}
              <div className="mt-auto border-t border-sand mx-3" />
              <div className="px-3 py-3">
                <form action={signOut}>
                  <Button
                    as="button"
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-2">
              My Account
            </p>
            <h1
              className="font-display font-bold italic text-heading mb-6 leading-tight"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              Profile
            </h1>

            <Card className="p-8">
              <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-6">
                Personal Information
              </p>
              <ProfileForm defaultValues={profile} />
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}

import { Card, Button, Avatar } from "@/shared/ui";
import { signOut } from "./actions";

interface ProfilePageProps {
  email: string;
}

export function ProfilePage({ email }: ProfilePageProps) {
  return (
    <main className="grow bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-sm">
        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          My Account
        </p>
        <h1
          className="font-display font-bold italic text-heading text-center mb-10 leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Profile
        </h1>

        <Card className="flex flex-col items-center gap-6 p-8">
          <Avatar initial={email} size="lg" />

          {/* Email */}
          <p className="font-body font-light text-earth/70 text-sm text-center break-all">
            {email}
          </p>

          <div className="w-full h-px bg-sand" />

          {/* Sign out */}
          <form action={signOut} className="w-full">
            <Button
              as="button"
              type="submit"
              variant="ghost"
              size="md"
              className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            >
              Sign out
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

import { Card, Avatar, Button } from "@/shared/ui";
import { AdminNav } from "./AdminNav";
import { SignOutButton } from "@/pages_flow/profile/SignOutButton";
import { USER_ROUTES, ADMIN_ROUTES } from "@/shared/consts/routes";

export function AdminSidebar({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
      <Card className="flex flex-col p-0 overflow-hidden lg:min-h-80">
        {/* Mobile: compact horizontal header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-sand lg:hidden">
          <Avatar initial={email} size="sm" />
          <p className="flex-1 font-body font-light text-earth/50 text-xs truncate">
            {email}
          </p>
          <SignOutButton>
            <Button
              as="button"
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            >
              Sign out
            </Button>
          </SignOutButton>
        </div>

        {/* Desktop: centered vertical header */}
        <div className="hidden lg:flex flex-col items-center gap-3 px-6 pt-8 pb-6">
          <Avatar initial={email} size="lg" />
          <p className="font-body font-light text-earth/50 text-xs text-center break-all">
            {email}
          </p>
        </div>

        <AdminNav items={USER_ROUTES} />

        {isAdmin && (
          <>
            <div className="block border-t border-sand lg:mx-3" />
            <AdminNav items={ADMIN_ROUTES} className="lg:pt-3" />
          </>
        )}

        {/* Desktop: separator + sign out */}
        <div className="hidden lg:block mt-auto border-t border-sand mx-3" />
        <div className="hidden lg:block px-3 py-3">
          <SignOutButton>
            <Button
              as="button"
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            >
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </Card>
    </aside>
  );
}

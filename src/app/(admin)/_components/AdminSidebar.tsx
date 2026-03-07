import { Card, Button, Avatar } from "@/shared/ui";
import { signOut } from "@/pages_flow/profile/actions";
import { AdminNav } from "./AdminNav";

export function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24">
      <Card className="flex flex-col p-0 overflow-hidden min-h-80">
        {/* User info */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
          <Avatar initial={email} size="lg" />
          <p className="font-body font-light text-earth/50 text-xs text-center break-all">
            {email}
          </p>
        </div>

        <AdminNav />

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
  );
}

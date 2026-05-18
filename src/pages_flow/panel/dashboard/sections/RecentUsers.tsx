import { Card, Skeleton } from "@/shared/ui";
import { getAdminUsers } from "@/lib/usersDb";
import { RecentUsersInner } from "./RecentUsersInner";

const RECENT_USERS_LIMIT = 5;

export async function RecentUsers() {
  const all = await getAdminUsers();
  return (
    <RecentUsersInner
      users={all.slice(0, RECENT_USERS_LIMIT)}
      total={all.length}
    />
  );
}

function UserRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5 border-b border-earth/6 last:border-b-0">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function RecentUsersSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Card padding="none" className="mb-8 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <UserRowSkeleton key={i} />
        ))}
      </Card>
    </>
  );
}

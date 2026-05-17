import { Suspense } from "react";
import { AdminPageHeader } from "@/app/panel/_components/AdminPageHeader";
import { Skeleton } from "@/shared/ui";
import { SearchParamsFilterProvider } from "@/providers/SearchParamsFilterProvider";
import { getAdminUsers } from "@/lib/usersDb";
import { UsersPage } from "@/pages_flow/panel/users/UsersPage";

const FILTER_KEYS = [
  "search",
  "gender",
  "hasOrders",
  "sortKey",
  "sortDir",
  "page",
  "pageSize",
];

function UsersSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 mb-6 xl:flex-row xl:items-end">
        <Skeleton className="h-9 w-full xl:flex-1" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:contents">
          <Skeleton className="h-9 w-full xl:w-44" />
          <Skeleton className="h-9 w-full xl:w-44" />
        </div>
      </div>

      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white-warm border border-parchment/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:block rounded-2xl bg-white-warm border border-parchment/30 overflow-hidden">
        <div className="flex gap-6 px-5 py-3 border-b border-parchment/30">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-3 w-24 rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex gap-6 px-5 py-4 border-b border-parchment/15 last:border-b-0"
          >
            {Array.from({ length: 6 }, (_, j) => (
              <Skeleton key={j} className="h-4 w-24 rounded" />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

async function UsersContent() {
  const users = await getAdminUsers();
  return <UsersPage users={users} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader title="Users" label="Admin Panel" />
      <SearchParamsFilterProvider keys={FILTER_KEYS}>
        <Suspense fallback={<UsersSkeleton />}>
          <UsersContent />
        </Suspense>
      </SearchParamsFilterProvider>
    </>
  );
}

"use client";

import { Users } from "lucide-react";
import { DataTable, DataCardPagination } from "@/shared/ui";
import { UserFilters } from "./UserFilters";
import { AdminUserCards } from "./AdminUserCards";
import { adminUserColumns } from "./columns";
import { useFilteredUsers } from "./useFilteredUsers";
import { useUsersTable } from "./useUsersTable";
import type { AdminUser } from "./types";

export function UsersPage({ users }: { users: AdminUser[] }) {
  const { filtered, searchFilter, genderFilter, hasOrdersFilter } =
    useFilteredUsers(users);

  const { paginatedData, sort, onSort, pagination } = useUsersTable(
    filtered,
    adminUserColumns,
  );

  const hasFilters = !!(
    searchFilter.value ||
    genderFilter.value ||
    hasOrdersFilter.value
  );

  const emptyDescription = hasFilters
    ? "Try adjusting filters to find what you're looking for."
    : "Registered users will appear here as soon as someone signs up.";

  return (
    <>
      <UserFilters />

      {/* Mobile: cards */}
      <div className="xl:hidden">
        <AdminUserCards
          users={paginatedData}
          emptyDescription={emptyDescription}
        />
        <DataCardPagination pagination={pagination} />
      </div>

      {/* Desktop: table */}
      <div className="hidden xl:block">
        <DataTable
          data={paginatedData}
          columns={adminUserColumns}
          keyExtractor={(u) => u.id}
          sort={sort}
          onSort={onSort}
          pagination={pagination}
          wrapperClassName="max-h-[70vh]"
          emptyIcon={<Users className="w-10 h-10 text-earth/15" />}
          emptyLabel="No users found"
          emptyDescription={emptyDescription}
        />
      </div>
    </>
  );
}

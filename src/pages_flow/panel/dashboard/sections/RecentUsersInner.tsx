"use client";

import Link from "next/link";
import { ArrowRight, Cake, Mail } from "lucide-react";
import { Card, CopyText } from "@/shared/ui";
import { formatAed, formatDate } from "@/shared/ui/Table";
import { WhatsAppLink } from "@/pages_flow/orders/ui/WhatsAppLink";
import {
  GenderIcon,
  formatBirthday,
  userLabel,
} from "@/pages_flow/panel/users/userDisplay";
import { UserActions } from "@/pages_flow/panel/users/UserActions";
import { SectionHeading } from "../ui";
import type { AdminUser } from "@/lib/usersDb";

interface RecentUsersInnerProps {
  users: AdminUser[];
}

function UserRow({ user }: { user: AdminUser }) {
  const label = userLabel(user.firstName, user.lastName, user.email, user.id);

  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5 border-b border-earth/6 last:border-b-0">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm text-earth truncate">
            {label}
          </span>
          {user.gender && <GenderIcon gender={user.gender} />}
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-2xs text-earth/50">
          {user.email && (
            <CopyText text={user.email} className="text-2xs text-earth/50">
              <span className="flex items-center gap-1 min-w-0">
                <Mail size={10} className="shrink-0" aria-hidden />
                <span className="truncate">{user.email}</span>
              </span>
            </CopyText>
          )}
          {user.phone && (
            <span className="flex items-center gap-1">
              <CopyText text={user.phone} className="text-2xs text-earth/50">
                <span>{user.phone}</span>
              </CopyText>
              <WhatsAppLink phone={user.phone} />
            </span>
          )}
          {user.birthday && (
            <span className="flex items-center gap-1">
              <Cake size={10} aria-hidden />
              {formatBirthday(user.birthday)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs text-earth/40 mt-0.5">
          <span>Registered {formatDate(user.createdAt)}</span>
          {user.orderCount > 0 && (
            <span className="text-orange/80">
              · {user.orderCount} {user.orderCount === 1 ? "order" : "orders"}{" "}
              · {formatAed(user.totalSpent)}
            </span>
          )}
        </div>
      </div>

      <UserActions user={user} />
    </div>
  );
}

export function RecentUsersInner({ users }: RecentUsersInnerProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <SectionHeading className="mb-0">Recent users</SectionHeading>
        <Link
          href="/panel/users"
          className="group flex items-center gap-1 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 hover:text-earth transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {users.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="font-body text-2xs text-earth/50">
            No registered users yet.
          </p>
        </Card>
      ) : (
        <Card padding="none" className="mb-8 overflow-hidden">
          {users.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </Card>
      )}
    </>
  );
}

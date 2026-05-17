import { Users, Mail, Cake } from "lucide-react";
import {
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
  Badge,
} from "@/shared/ui";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { WhatsAppLink } from "@/pages_flow/orders/ui/WhatsAppLink";
import { GenderIcon, formatBirthday, userLabel } from "./userDisplay";
import { UserActions } from "./UserActions";
import type { AdminUser } from "./types";

interface AdminUserCardsProps {
  users: AdminUser[];
  emptyDescription?: string;
}

export function AdminUserCards({ users, emptyDescription }: AdminUserCardsProps) {
  if (users.length === 0) {
    return (
      <DataCardEmpty
        icon={<Users className="w-10 h-10 text-earth/15" />}
        label="No users found"
        description={emptyDescription}
      />
    );
  }

  return (
    <DataCardList className="sm:grid-cols-2">
      {users.map((user) => {
        const label = userLabel(user.firstName, user.lastName, user.email, user.id);
        return (
          <DataCard key={user.id} className="flex flex-col">
            <DataCardHeader>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-sm text-earth truncate">
                  {label}
                </span>
                {user.gender && <GenderIcon gender={user.gender} />}
                {user.role !== "user" && (
                  <Badge variant="outline" size="xs" className="shrink-0">
                    {user.role}
                  </Badge>
                )}
              </div>
            </DataCardHeader>

            <DataCardBody className="gap-1.5 flex-1">
              {user.email && (
                <CopyText text={user.email} className="text-2xs text-earth/55">
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={11} className="shrink-0" aria-hidden />
                    <span className="truncate">{user.email}</span>
                  </span>
                </CopyText>
              )}

              {user.phone && (
                <div className="flex items-center gap-1">
                  <CopyText text={user.phone} className="text-2xs text-earth/55">
                    <span>{user.phone}</span>
                  </CopyText>
                  <WhatsAppLink phone={user.phone} />
                </div>
              )}

              {user.birthday && (
                <span className="flex items-center gap-1 text-2xs text-earth/55">
                  <Cake size={11} aria-hidden />
                  {formatBirthday(user.birthday)}
                </span>
              )}

              <div className="mt-1">
                {user.orderCount > 0 ? (
                  <p className="text-2xs">
                    <span className="font-semibold text-earth">
                      {user.orderCount} {user.orderCount === 1 ? "order" : "orders"}
                    </span>
                    <span className="text-orange ml-1.5">
                      · {formatAed(user.totalSpent)}
                    </span>
                  </p>
                ) : (
                  <p className="text-2xs text-earth/35">No orders yet</p>
                )}
                {user.lastOrderAt && (
                  <p className="text-2xs text-earth/40 mt-0.5">
                    Last order {formatDateTime(user.lastOrderAt)}
                  </p>
                )}
              </div>
            </DataCardBody>

            <DataCardFooter className="flex items-center justify-between gap-2">
              <span className="text-2xs text-earth/40">
                Registered {formatDateTime(user.createdAt)}
              </span>
              <UserActions user={user} />
            </DataCardFooter>
          </DataCard>
        );
      })}
    </DataCardList>
  );
}

import { Mail } from "lucide-react";
import type { ColumnDef } from "@/shared/ui";
import {
  formatAed,
  formatDateTime,
  compareString,
  compareNumber,
  compareDate,
} from "@/shared/ui/Table";
import { CopyText, Badge } from "@/shared/ui";
import { WhatsAppLink } from "@/pages_flow/orders/ui/WhatsAppLink";
import { GenderIcon, formatBirthday, userLabel } from "./userDisplay";
import { UserActions } from "./UserActions";
import type { AdminUser, UserSortKey } from "./types";

type Key = UserSortKey | "contact" | "actions";

const dim = <span className="text-2xs text-earth/20">—</span>;

export const adminUserColumns: ColumnDef<AdminUser, Key>[] = [
  {
    key: "name",
    header: "User",
    cell: (u) => {
      const label = userLabel(u.firstName, u.lastName, u.email, u.id);
      return (
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-earth truncate">
              {label}
            </span>
            {u.gender && <GenderIcon gender={u.gender} />}
            {u.role !== "user" && (
              <Badge variant="outline" size="xs" className="shrink-0">
                {u.role}
              </Badge>
            )}
          </div>
          {u.email && (
            <CopyText text={u.email} className="text-2xs text-earth/50">
              <span className="flex items-center gap-1 truncate">
                <Mail size={10} className="shrink-0" aria-hidden />
                <span className="truncate">{u.email}</span>
              </span>
            </CopyText>
          )}
        </div>
      );
    },
    sortable: true,
    compare: compareString((u) =>
      userLabel(u.firstName, u.lastName, u.email, u.id).toLowerCase(),
    ),
    headerClassName: "min-w-56",
  },
  {
    key: "contact",
    header: "Contact",
    cell: (u) =>
      u.phone ? (
        <div className="flex items-center gap-1">
          <CopyText text={u.phone} className="text-2xs text-earth/60">
            <span className="whitespace-nowrap">{u.phone}</span>
          </CopyText>
          <WhatsAppLink phone={u.phone} />
        </div>
      ) : (
        dim
      ),
    headerClassName: "min-w-40",
  },
  {
    key: "gender",
    header: "Birthday",
    cell: (u) =>
      u.birthday ? (
        <span className="text-2xs text-earth/65 whitespace-nowrap">
          {formatBirthday(u.birthday)}
        </span>
      ) : (
        dim
      ),
    sortable: true,
    compare: compareString((u) => u.birthday ?? ""),
    headerClassName: "min-w-32",
  },
  {
    key: "orders",
    header: "Orders",
    cell: (u) => {
      if (u.orderCount === 0) {
        return <span className="text-2xs text-earth/30">No orders</span>;
      }
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs font-semibold text-earth">
            {u.orderCount} {u.orderCount === 1 ? "order" : "orders"}
          </span>
          <span className="text-2xs text-orange">{formatAed(u.totalSpent)}</span>
        </div>
      );
    },
    sortable: true,
    compare: compareNumber((u) => u.totalSpent),
    headerClassName: "min-w-28",
  },
  {
    key: "lastOrder",
    header: "Last order",
    cell: (u) =>
      u.lastOrderAt ? (
        <span className="text-2xs text-earth/60 whitespace-nowrap">
          {formatDateTime(u.lastOrderAt)}
        </span>
      ) : (
        dim
      ),
    sortable: true,
    compare: compareDate((u) => u.lastOrderAt ?? "1970-01-01"),
    headerClassName: "min-w-40",
  },
  {
    key: "createdAt",
    header: "Registered",
    cell: (u) => (
      <span className="text-2xs text-earth/60 whitespace-nowrap">
        {formatDateTime(u.createdAt)}
      </span>
    ),
    sortable: true,
    compare: compareDate((u) => u.createdAt),
    headerClassName: "min-w-40",
  },
  {
    key: "actions",
    header: "",
    cell: (u) => <UserActions user={u} className="justify-end" />,
    headerClassName: "min-w-28 text-right",
    cellClassName: "text-right",
  },
];

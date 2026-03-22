import {
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardField,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
} from "@/shared/ui";
import { displayAddress } from "@/shared/utils/address";
import { formatAed, formatDateTime } from "@/shared/ui/Table";
import { IconReceipt } from "@/shared/icons";
import { StatusBadge } from "@/pages_flow/orders/ui/StatusBadge";
import { CopyOrderId } from "@/pages_flow/orders/ui/CopyOrderId";
import type { AdminOrder } from "@/pages_flow/orders/types";
import { FulfilledToggle } from "./FulfilledToggle";

interface AdminOrderCardsProps {
  orders: AdminOrder[];
  emptyDescription?: string;
}

export function AdminOrderCards({
  orders,
  emptyDescription,
}: AdminOrderCardsProps) {
  if (orders.length === 0) {
    return (
      <DataCardEmpty
        icon={<IconReceipt className="w-10 h-10 text-earth/15" />}
        label="No orders found"
        description={emptyDescription}
      />
    );
  }

  return (
    <DataCardList className="sm:grid-cols-2">
      {orders.map((order) => (
        <DataCard key={order.id}>
          <DataCardHeader>
            <div className="flex items-center gap-2">
              <FulfilledToggle
                orderId={order.id}
                defaultChecked={order.is_fulfilled}
              />
              <CopyOrderId id={order.id} />
            </div>
            <StatusBadge status={order.status} />
          </DataCardHeader>

          <DataCardBody>
            <DataCardField label="Customer">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">
                  {order.first_name} {order.last_name}
                </span>
                <span className="text-2xs text-earth/50">{order.email}</span>
                <span className="text-2xs text-earth/40">{order.phone}</span>
                {(order.gender || order.birthday) && (
                  <span className="text-2xs text-earth/30">
                    {order.gender
                      ? order.gender.charAt(0).toUpperCase() +
                        order.gender.slice(1)
                      : null}
                    {order.gender && order.birthday ? " · " : null}
                    {order.birthday
                      ? new Date(order.birthday).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : null}
                  </span>
                )}
              </div>
            </DataCardField>

            <DataCardField label="Items">
              <div className="flex flex-col gap-1">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-earth">
                      {item.name}
                      <span className="text-earth/40 ml-1">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span className="text-2xs text-earth/50 whitespace-nowrap">
                      {formatAed(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </DataCardField>

            <DataCardField label="Cost">
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-3">
                  <span className="text-2xs text-earth/50">Subtotal</span>
                  <span className="text-2xs text-earth/60">
                    {formatAed(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-2xs text-earth/50">Delivery</span>
                  <span className="text-2xs text-earth/60">
                    {formatAed(order.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 pt-2 border-t border-earth/8 mt-0.5">
                  <span className="text-sm font-semibold text-earth">
                    Total
                  </span>
                  <span className="text-sm font-semibold text-earth">
                    {formatAed(order.total)}
                  </span>
                </div>
              </div>
            </DataCardField>

            <DataCardField label="Address">
              {order.address ? (
                <CopyText
                  text={displayAddress(order.address)}
                  className="text-2xs text-earth/60"
                >
                  <span>{displayAddress(order.address)}</span>
                </CopyText>
              ) : (
                <span className="text-2xs text-earth/20">—</span>
              )}
            </DataCardField>

            {order.notes && (
              <DataCardField label="Notes">
                <span className="text-2xs text-earth/60 italic">
                  {order.notes}
                </span>
              </DataCardField>
            )}
          </DataCardBody>

          <DataCardFooter className="flex items-center justify-end">
            <span className="text-2xs text-earth/50">
              {formatDateTime(order.created_at)}
            </span>
          </DataCardFooter>
        </DataCard>
      ))}
    </DataCardList>
  );
}

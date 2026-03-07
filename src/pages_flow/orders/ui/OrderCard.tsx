import { Badge, Card } from "@/shared/ui";
import { OrderStatus } from "@/shared/types";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  address: string;
  created_at: string;
  order_items: OrderItem[];
};

function StatusBadge({ status }: { status: string }) {
  if (status === OrderStatus.PAID) {
    return (
      <Badge variant="natural" size="sm">
        Paid
      </Badge>
    );
  }
  if (status === OrderStatus.PENDING) {
    return (
      <Badge variant="warm" size="sm">
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="sm" className="text-red-500 border-red-200">
      {status === OrderStatus.CANCELLED ? "Cancelled" : "Failed"}
    </Badge>
  );
}

export function OrderCard({ order }: { order: Order }) {
  const date = new Date(order.created_at);
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card variant="default" padding="sm" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-body font-bold text-earth text-sm uppercase tracking-widest truncate">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="font-body font-light text-earth/65 text-2xs">
            {timeStr}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 mb-4">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-earth text-sm leading-snug truncate">
                {item.name}
              </p>
              <p className="font-body font-light text-earth/65 text-2xs mt-0.5">
                AED {Number(item.price).toFixed(2)} each
              </p>
            </div>
            <span className="font-body font-light text-earth/65 text-2xs shrink-0">
              ×{item.quantity}
            </span>
            <p className="font-body font-semibold text-earth text-sm shrink-0 text-right w-20">
              AED {(Number(item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-sand mb-4" />

      {/* Totals */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex justify-between">
          <span className="font-body font-light text-earth/70 text-2xs">
            Subtotal
          </span>
          <span className="font-body font-light text-earth/70 text-2xs">
            AED {Number(order.subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-body font-light text-earth/70 text-2xs">
            Delivery
          </span>
          <span className="font-body font-light text-earth/70 text-2xs">
            AED {Number(order.delivery_fee).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-body font-semibold text-earth text-sm">
            Total
          </span>
          <span className="font-body font-semibold text-earth text-sm">
            AED {Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="flex gap-2 items-center pt-3 border-t border-sand">
        <span className="font-body font-semibold uppercase tracking-widest text-2xs text-earth/50 shrink-0 ">
          Delivery to
        </span>
        <span className="font-body font-light text-earth/70 text-2xs leading-relaxed">
          {order.address}
        </span>
      </div>
    </Card>
  );
}

import { Receipt, Ticket } from "lucide-react";
import { Button, Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui";
import { WhatsAppLink } from "@/pages_flow/orders/ui/WhatsAppLink";
import type { AdminUser } from "./types";

interface UserActionsProps {
  user: AdminUser;
  className?: string;
}

export function UserActions({ user, className }: UserActionsProps) {
  const promoHref = `/panel/promo-codes/create?user=${user.id}`;
  const ordersSearch = user.email ?? user.id;
  const ordersHref = `/panel/all-orders?search=${encodeURIComponent(ordersSearch)}`;

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {user.phone && <WhatsAppLink phone={user.phone} />}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            href={promoHref}
            variant="text"
            size="icon"
            aria-label="Create promo code"
            className="text-orange/60 hover:text-orange"
          >
            <Ticket className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Create promo code</TooltipContent>
      </Tooltip>

      {user.orderCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              href={ordersHref}
              variant="text"
              size="icon"
              aria-label="View orders"
              className="text-earth/50 hover:text-earth"
            >
              <Receipt className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View orders</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

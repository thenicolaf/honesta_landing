import { ShoppingBag, CreditCard, Handshake, Bell, Tag, Package, LayoutGrid, CircleX, Ban } from "lucide-react";

interface NotificationTypeStyle {
  icon: React.ReactNode;
  dot: string;
  bg: string;
  iconColor: string;
}

const TYPE_STYLES: Record<string, NotificationTypeStyle> = {
  new_order: {
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    dot: "bg-orange",
    bg: "bg-orange/8",
    iconColor: "text-orange",
  },
  order_paid: {
    icon: <CreditCard className="w-3.5 h-3.5" />,
    dot: "bg-moss",
    bg: "bg-moss/8",
    iconColor: "text-moss",
  },
  new_partnership: {
    icon: <Handshake className="w-3.5 h-3.5" />,
    dot: "bg-bark",
    bg: "bg-bark/8",
    iconColor: "text-bark",
  },
  new_promotion: {
    icon: <Tag className="w-3.5 h-3.5" />,
    dot: "bg-orange",
    bg: "bg-orange/8",
    iconColor: "text-orange",
  },
  new_product: {
    icon: <Package className="w-3.5 h-3.5" />,
    dot: "bg-moss",
    bg: "bg-moss/8",
    iconColor: "text-moss",
  },
  new_category: {
    icon: <LayoutGrid className="w-3.5 h-3.5" />,
    dot: "bg-bark",
    bg: "bg-bark/8",
    iconColor: "text-bark",
  },
  order_failed: {
    icon: <CircleX className="w-3.5 h-3.5" />,
    dot: "bg-red-500",
    bg: "bg-red-500/8",
    iconColor: "text-red-500",
  },
  order_cancelled: {
    icon: <Ban className="w-3.5 h-3.5" />,
    dot: "bg-earth/40",
    bg: "bg-earth/6",
    iconColor: "text-earth/40",
  },
};

const DEFAULT_STYLE: NotificationTypeStyle = {
  icon: <Bell className="w-3.5 h-3.5" />,
  dot: "bg-earth/40",
  bg: "bg-sand/60",
  iconColor: "text-earth/40",
};

export function getNotificationStyle(type: string): NotificationTypeStyle {
  return TYPE_STYLES[type] ?? DEFAULT_STYLE;
}

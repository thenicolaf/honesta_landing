import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartAndCleanup } from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import { formatOrderNotificationMessage } from "@/lib/orderNotifications";
import { deductInventoryForOrder } from "@/lib/inventoryDb";

const STATUS_MAP: Record<string, OrderStatus> = {
  PURCHASED: OrderStatus.PAID,
  CAPTURED: OrderStatus.PAID,
  FAILED: OrderStatus.FAILED,
  REVERSED: OrderStatus.CANCELLED,
};

const NOTIFICATION_META: Partial<
  Record<OrderStatus, { type: "order_paid" | "order_failed" | "order_cancelled"; title: string }>
> = {
  [OrderStatus.PAID]: { type: "order_paid", title: "Order paid" },
  [OrderStatus.FAILED]: { type: "order_failed", title: "Payment failed" },
  [OrderStatus.CANCELLED]: { type: "order_cancelled", title: "Order cancelled" },
};

interface OrderItem {
  name: string;
  quantity: number;
  variant_id: string | null;
}

interface SettledOrder {
  id: string;
  total: number;
  promo_code_id: string | null;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  delivery_schedule: string | null;
  order_items: OrderItem[];
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.NGENIUS_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get("x-webhook-secret") === secret;
}

// Atomic status transition: returns the row only on the first transition into
// `newStatus` thanks to .neq(...). Idempotent — second call returns null.
async function transitionOrderStatus(
  ngeniusRef: string,
  newStatus: OrderStatus,
): Promise<SettledOrder | null> {
  const { data } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", ngeniusRef)
    .neq("status", newStatus)
    .select(
      "id, total, promo_code_id, user_id, first_name, last_name, delivery_schedule, order_items(name, quantity, variant_id)",
    )
    .single();
  return data as SettledOrder | null;
}

async function runPaidSideEffects(
  order: SettledOrder,
  message: string,
): Promise<void> {
  const variantIds = order.order_items
    .map((i) => i.variant_id)
    .filter((id): id is string => !!id);

  await Promise.all([
    deductInventoryForOrder(order.id),
    order.promo_code_id && order.user_id
      ? recordPromoCodeRedemption({
          promoCodeId: order.promo_code_id,
          orderId: order.id,
          userId: order.user_id,
        })
      : null,
    order.user_id ? clearCartAndCleanup(supabaseAdmin, order.user_id) : null,
    variantIds.length > 0 ? cleanupOrphanedMixVariants(variantIds) : null,
    createNotification({
      type: "order_paid",
      title: "Order paid",
      message,
      relatedId: order.id,
    }),
  ]);
}

async function notifyNonPaidTransition(
  order: SettledOrder,
  newStatus: OrderStatus,
  message: string,
): Promise<void> {
  const meta = NOTIFICATION_META[newStatus];
  if (!meta) return;
  await createNotification({ ...meta, message, relatedId: order.id });
}

async function handleWebhookEvent(payload: {
  orderReference: string;
  eventName: string;
}): Promise<void> {
  const newStatus = STATUS_MAP[payload.eventName];
  if (!newStatus) return;

  const order = await transitionOrderStatus(payload.orderReference, newStatus);
  if (!order) return;

  const message = formatOrderNotificationMessage(order, order.order_items);

  if (newStatus === OrderStatus.PAID) {
    await runPaidSideEffects(order, message);
  } else {
    await notifyNonPaidTransition(order, newStatus, message);
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    await handleWebhookEvent(payload);
  } catch (err) {
    // N-Genius does not retry failed webhooks, so swallow + log to keep the
    // 200 response below — order status may already be updated and we don't
    // want a thrown side-effect to lose the ACK.
    console.error("N-Genius webhook handler failed:", err);
  }

  // N-Genius requires 200 within 15 seconds; does not retry failed webhooks
  return NextResponse.json({ success: true }, { status: 200 });
}

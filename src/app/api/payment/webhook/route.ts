import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartInDb } from "@/lib/cartDb";

const STATUS_MAP: Record<string, OrderStatus> = {
  PURCHASED: OrderStatus.PAID,
  CAPTURED: OrderStatus.PAID,
  FAILED: OrderStatus.FAILED,
  REVERSED: OrderStatus.CANCELLED,
};

export async function POST(request: NextRequest) {
  const secret = process.env.NGENIUS_WEBHOOK_SECRET;

  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  const ngeniusRef: string = payload.orderReference;
  const eventName: string = payload.eventName;

  const newStatus = STATUS_MAP[eventName];

  if (newStatus) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("ngenius_ref", ngeniusRef)
      .neq("status", newStatus)
      .select("id, total, promo_code_id, user_id")
      .single();

    if (order) {
      const total = `AED ${Number(order.total).toFixed(2)}`;
      if (newStatus === OrderStatus.PAID) {
        if (order.promo_code_id && order.user_id) {
          await recordPromoCodeRedemption({
            promoCodeId: order.promo_code_id as string,
            orderId: order.id as string,
            userId: order.user_id as string,
          });
        }
        if (order.user_id) {
          await clearCartInDb(supabaseAdmin, order.user_id as string);
        }
        await createNotification({
          type: "order_paid",
          title: "Order paid",
          message: total,
          relatedId: order.id,
        });
      } else if (newStatus === OrderStatus.FAILED) {
        await createNotification({
          type: "order_failed",
          title: "Payment failed",
          message: total,
          relatedId: order.id,
        });
      } else if (newStatus === OrderStatus.CANCELLED) {
        await createNotification({
          type: "order_cancelled",
          title: "Order cancelled",
          message: total,
          relatedId: order.id,
        });
      }
    }
  }

  // N-Genius requires 200 within 15 seconds; does not retry failed webhooks
  return NextResponse.json({ success: true }, { status: 200 });
}

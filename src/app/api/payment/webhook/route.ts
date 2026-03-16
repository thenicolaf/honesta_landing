import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";

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
      .select("id, total")
      .single();

    if (order && newStatus === OrderStatus.PAID) {
      await createNotification(
        "order_paid",
        "Order paid",
        `AED ${Number(order.total).toFixed(2)}`,
        order.id,
      );
    }
  }

  // N-Genius requires 200 within 15 seconds; does not retry failed webhooks
  return NextResponse.json({ success: true }, { status: 200 });
}

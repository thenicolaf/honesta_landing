import type { Metadata } from "next";
import { getOrderStatus } from "@/lib/ngenius";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartAndCleanup } from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import {
  buildOrderNotificationParts,
  formatOrderNotificationMessage,
  type OrderNotificationParts,
} from "@/lib/orderNotifications";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";
import { ResultToast } from "./ResultToast";
import { ResultCard, MissingRefCard } from "./ui";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SUCCESS_STATES = new Set(["PURCHASED", "CAPTURED"]);
const FAIL_STATES = new Set(["FAILED", "DECLINED"]);

async function resolvePaymentState(orderRef: string) {
  try {
    const order = await getOrderStatus(orderRef);
    return order?._embedded?.payment?.[0]?.state as string | undefined;
  } catch {
    return undefined;
  }
}

interface SettleResult {
  title: string;
  parts: OrderNotificationParts;
}

async function settleOrder(
  orderRef: string,
  success: boolean,
): Promise<SettleResult | null> {
  const newStatus = success ? OrderStatus.PAID : OrderStatus.FAILED;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", orderRef)
    .neq("status", newStatus)
    .select(
      "id, total, promo_code_id, user_id, first_name, last_name, delivery_schedule, order_items(name, quantity, variant_id)",
    )
    .single();

  if (!order) return null;

  const items = (order.order_items ?? []) as Array<{
    name: string;
    quantity: number;
    variant_id: string | null;
  }>;

  const parts = buildOrderNotificationParts(order, items);
  const title = success ? "Order paid" : "Payment failed";

  await Promise.all([
    success && order.promo_code_id && order.user_id
      ? recordPromoCodeRedemption({
          promoCodeId: order.promo_code_id as string,
          orderId: order.id as string,
          userId: order.user_id as string,
        })
      : null,
    success && order.user_id
      ? clearCartAndCleanup(supabaseAdmin, order.user_id as string)
      : null,
    createNotification({
      type: success ? "order_paid" : "order_failed",
      title,
      message: formatOrderNotificationMessage(order, items),
      relatedId: order.id,
    }),
  ]);

  if (success) {
    const variantIds = items
      .map((i) => i.variant_id)
      .filter((id): id is string => !!id);
    if (variantIds.length > 0) {
      await cleanupOrphanedMixVariants(variantIds);
    }
  }

  return { title, parts };
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref: orderRef } = await searchParams;

  if (!orderRef) return <MissingRefCard />;

  const paymentState = await resolvePaymentState(orderRef);

  const success = paymentState ? SUCCESS_STATES.has(paymentState) : false;
  const settled = paymentState
    ? SUCCESS_STATES.has(paymentState) || FAIL_STATES.has(paymentState)
    : false;

  let toastTitle: string | null = null;
  let toastParts: OrderNotificationParts | null = null;
  if (settled) {
    const settledResult = await settleOrder(orderRef, success);
    toastTitle = settledResult?.title ?? null;
    toastParts = settledResult?.parts ?? null;
  }

  let deliverySchedule: string | null = null;
  if (success) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select("delivery_schedule")
      .eq("ngenius_ref", orderRef)
      .single();
    deliverySchedule = (data?.delivery_schedule as string | null) ?? null;
  }

  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      {success && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{localStorage.removeItem("honesta_cart");localStorage.removeItem("honesta_promo_code");}catch(e){}`,
            }}
          />
          <ClearCartOnSuccess success={success} />
        </>
      )}
      <ResultToast success={success} title={toastTitle} parts={toastParts} />
      <ResultCard
        success={success}
        paymentState={paymentState}
        orderRef={orderRef}
        deliverySchedule={deliverySchedule}
      />
    </main>
  );
}

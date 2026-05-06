import type { Metadata } from "next";
import { getOrderStatus } from "@/lib/ngenius";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartAndCleanup } from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import { deductInventoryForOrder } from "@/lib/inventoryDb";
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

const PAID_TITLE = "Order paid";
const FAILED_TITLE = "Payment failed";

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

interface SettleResult {
  title: string;
  parts: OrderNotificationParts;
}

async function resolvePaymentState(orderRef: string): Promise<string | undefined> {
  try {
    const order = await getOrderStatus(orderRef);
    return order?._embedded?.payment?.[0]?.state as string | undefined;
  } catch {
    return undefined;
  }
}

// Atomic status transition: returns the row only on the first transition into
// `newStatus` thanks to .neq(...). Idempotent — second call returns null.
async function transitionOrderStatus(
  orderRef: string,
  newStatus: OrderStatus,
): Promise<SettledOrder | null> {
  const { data } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", orderRef)
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
      title: PAID_TITLE,
      message,
      relatedId: order.id,
    }),
  ]);
}

async function notifyFailedTransition(
  order: SettledOrder,
  message: string,
): Promise<void> {
  await createNotification({
    type: "order_failed",
    title: FAILED_TITLE,
    message,
    relatedId: order.id,
  });
}

async function settleOrder(
  orderRef: string,
  success: boolean,
): Promise<SettleResult | null> {
  const newStatus = success ? OrderStatus.PAID : OrderStatus.FAILED;
  const order = await transitionOrderStatus(orderRef, newStatus);
  if (!order) return null;

  const message = formatOrderNotificationMessage(order, order.order_items);
  const parts = buildOrderNotificationParts(order, order.order_items);
  const title = success ? PAID_TITLE : FAILED_TITLE;

  if (success) {
    await runPaidSideEffects(order, message);
  } else {
    await notifyFailedTransition(order, message);
  }

  return { title, parts };
}

async function loadDeliverySchedule(orderRef: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from("orders")
      .select("delivery_schedule")
      .eq("ngenius_ref", orderRef)
      .single();
    return (data?.delivery_schedule as string | null) ?? null;
  } catch {
    return null;
  }
}

async function safeSettleOrder(
  orderRef: string,
  success: boolean,
): Promise<SettleResult | null> {
  try {
    return await settleOrder(orderRef, success);
  } catch (err) {
    // Don't crash the result page — the user just paid and deserves to see
    // the outcome. Side-effects might be partially applied; the webhook is
    // idempotent and will reconcile on its end.
    console.error("Failed to settle order on result page:", err);
    return null;
  }
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

  const settledResult = settled ? await safeSettleOrder(orderRef, success) : null;
  const toastTitle = settledResult?.title ?? null;
  const toastParts = settledResult?.parts ?? null;

  const deliverySchedule = success ? await loadDeliverySchedule(orderRef) : null;

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

import type { Metadata } from "next";
import { getOrderStatus } from "@/lib/ngenius";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartAndCleanup } from "@/lib/cartDb";
import { cleanupOrphanedMixVariants } from "@/pages_flow/mix/actions";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";
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

async function settleOrder(orderRef: string, success: boolean) {
  const newStatus = success ? OrderStatus.PAID : OrderStatus.FAILED;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", orderRef)
    .neq("status", newStatus)
    .select("id, total, promo_code_id, user_id")
    .single();

  if (!order) return;

  const total = `AED ${Number(order.total).toFixed(2)}`;

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
      title: success ? "Order paid" : "Payment failed",
      message: total,
      relatedId: order.id,
    }),
  ]);

  if (success) {
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select("variant_id")
      .eq("order_id", order.id);
    const variantIds = (orderItems ?? [])
      .map((i) => i.variant_id)
      .filter((id): id is string => !!id);
    if (variantIds.length > 0) {
      await cleanupOrphanedMixVariants(variantIds);
    }
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

  if (settled) {
    await settleOrder(orderRef, success);
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
      <ResultCard success={success} paymentState={paymentState} orderRef={orderRef} />
    </main>
  );
}

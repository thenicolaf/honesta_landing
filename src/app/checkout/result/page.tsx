import type { Metadata } from "next";
import { Card, Button } from "@/shared/ui";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { IconCheckCircle, IconAlertCircle } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { getOrderStatus } from "@/lib/ngenius";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import { recordPromoCodeRedemption } from "@/lib/promoCodesDb";
import { clearCartInDb } from "@/lib/cartDb";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";

const SUCCESS_STATES = new Set(["PURCHASED", "CAPTURED"]);
const FAIL_STATES = new Set(["FAILED", "DECLINED"]);

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
        <Card variant="default" padding="lg" className="max-w-md w-full text-center">
          <p className="font-body text-earth mb-6">Missing order reference.</p>
          <Button href="/">Back to Home</Button>
        </Card>
      </main>
    );
  }

  let paymentState: string | undefined;
  try {
    const order = await getOrderStatus(ref);
    paymentState = order?._embedded?.payment?.[0]?.state;
  } catch {
    // treat as failed payment
  }

  const success = paymentState ? SUCCESS_STATES.has(paymentState) : false;
  const settled = paymentState
    ? SUCCESS_STATES.has(paymentState) || FAIL_STATES.has(paymentState)
    : false;

  if (settled) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({
        status: success ? OrderStatus.PAID : OrderStatus.FAILED,
        updated_at: new Date().toISOString(),
      })
      .eq("ngenius_ref", ref)
      .neq("status", success ? OrderStatus.PAID : OrderStatus.FAILED)
      .select("id, total, promo_code_id, user_id")
      .single();

    if (order) {
      if (success && order.promo_code_id && order.user_id) {
        await recordPromoCodeRedemption({
          promoCodeId: order.promo_code_id as string,
          orderId: order.id as string,
          userId: order.user_id as string,
        });
      }

      // Wipe the user's server-side cart the moment we know the order
      // was actually paid — CartProvider then loads an empty cart on
      // mount. For guests we clear localStorage via the inline script
      // rendered below.
      if (success && order.user_id) {
        await clearCartInDb(supabaseAdmin, order.user_id as string);
      }

      const total = `AED ${Number(order.total).toFixed(2)}`;
      await createNotification({
        type: success ? "order_paid" : "order_failed",
        title: success ? "Order paid" : "Payment failed",
        message: total,
        relatedId: order.id,
      });
    }
  }

  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      {success && (
        <>
          <script
            // Synchronously wipes the guest cart from localStorage before
            // CartProvider mounts and reads it. Safe for authenticated
            // users too — their cart is already cleared in the DB above,
            // and the client store just has a stale copy.
            dangerouslySetInnerHTML={{
              __html: `try{localStorage.removeItem("honesta_cart");localStorage.removeItem("honesta_promo_code");}catch(e){}`,
            }}
          />
          <ClearCartOnSuccess success={success} />
        </>
      )}
      <div className="max-w-md w-full">
        <Card variant="default" padding="lg" className="text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center",
              success ? "bg-moss/10" : "bg-orange/10",
            )}
          >
            {success ? (
              <IconCheckCircle className="w-8 h-8 text-moss" />
            ) : (
              <IconAlertCircle className="w-8 h-8 text-orange" />
            )}
          </div>

          <h1 className="font-display font-semibold text-heading text-2xl mb-2">
            {success ? "Payment Successful" : "Payment Failed"}
          </h1>

          <p className="font-body font-light text-earth/60 text-sm mb-2">
            {success
              ? "Your order has been confirmed. We'll deliver soon!"
              : "Something went wrong with your payment. Please try again."}
          </p>

          {paymentState && (
            <p className="font-body text-xs text-earth/40 mb-1">
              Status: {paymentState}
            </p>
          )}
          <p className="font-body text-xs text-earth/30 mb-8 break-all">
            Ref: {ref}
          </p>

          <div className="flex flex-col gap-3">
            <Button href="/">Back to Home</Button>
            {!success && (
              <Button href="/cart" variant="outline">
                Back to Cart
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

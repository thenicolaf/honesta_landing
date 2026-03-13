import { Card, Button } from "@/shared/ui";
import { IconCheckCircle, IconAlertCircle } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { getOrderStatus } from "@/lib/ngenius";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
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
      <main className="grow bg-cream flex items-center justify-center px-4 py-16">
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
    await supabaseAdmin
      .from("orders")
      .update({
        status: success ? OrderStatus.PAID : OrderStatus.FAILED,
        updated_at: new Date().toISOString(),
      })
      .eq("ngenius_ref", ref);
  }

  return (
    <main className="grow bg-cream flex items-center justify-center px-4 py-16">
      <ClearCartOnSuccess success={success} />
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

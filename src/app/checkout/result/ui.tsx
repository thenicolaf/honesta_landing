import { Card, Button } from "@/shared/ui";
import { IconCheckCircle, IconAlertCircle } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

export function MissingRefCard() {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <Card variant="default" padding="lg" className="max-w-md w-full text-center">
        <p className="font-body text-earth mb-6">Missing order reference.</p>
        <Button href="/">Back to Home</Button>
      </Card>
    </main>
  );
}

export function ResultCard({
  success,
  paymentState,
  orderRef,
  deliverySchedule,
}: {
  success: boolean;
  paymentState?: string;
  orderRef: string;
  deliverySchedule?: string | null;
}) {
  return (
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

        {success && deliverySchedule && (
          <p className="font-body text-sm text-earth mb-3">
            <span className="text-earth/55">Delivery: </span>
            {deliverySchedule}
          </p>
        )}

        {paymentState && (
          <p className="font-body text-xs text-earth/40 mb-1">
            Status: {paymentState}
          </p>
        )}
        <p className="font-body text-xs text-earth/30 mb-8 break-all">
          Ref: {orderRef}
        </p>

        <div className="flex flex-col gap-3">
          {success ? (
            <Button href="/">Back to Home</Button>
          ) : (
            <>
              <Button href="/cart">Back to Cart</Button>
              <Button href="/" variant="outline">
                Back to Home
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

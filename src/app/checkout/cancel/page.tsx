import type { Metadata } from "next";
import { Card, Button } from "@/shared/ui";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function cancelOrder(orderRef: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .update({
      status: OrderStatus.CANCELLED,
      updated_at: new Date().toISOString(),
    })
    .eq("ngenius_ref", orderRef)
    .neq("status", OrderStatus.CANCELLED)
    .select("id, total")
    .single();

  if (order) {
    await createNotification({
      type: "order_cancelled",
      title: "Order cancelled",
      message: `AED ${Number(order.total).toFixed(2)}`,
      relatedId: order.id,
    });
  }
}

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref: orderRef } = await searchParams;

  if (orderRef) {
    await cancelOrder(orderRef);
  }

  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <Card variant="default" padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-sand mx-auto mb-6 flex items-center justify-center">
            <span className="font-body font-semibold text-earth/50 text-2xl">
              —
            </span>
          </div>

          <h1 className="font-display font-semibold text-heading text-2xl mb-2">
            Payment Cancelled
          </h1>

          <p className="font-body font-light text-earth/60 text-sm mb-8">
            No charges were made. Your cart is still saved — you can try again
            whenever you&apos;re ready.
          </p>

          <div className="flex flex-col gap-3">
            <Button href="/cart">Back to Cart</Button>
            <Button href="/" variant="outline">
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

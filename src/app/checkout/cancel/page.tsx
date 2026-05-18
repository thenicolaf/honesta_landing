import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, Button } from "@/shared/ui";
import { supabaseAdmin } from "@/lib/supabase.server";
import { OrderStatus } from "@/shared/types";
import { createNotification } from "@/lib/notificationsDb";
import {
  buildOrderNotificationParts,
  formatOrderNotificationMessage,
  type OrderNotificationParts,
} from "@/lib/orderNotifications";
import { ResultToast } from "../result/ResultToast";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface CancelResult {
  title: string;
  parts: OrderNotificationParts;
}

async function cancelOrder(orderRef: string): Promise<CancelResult | null> {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .update({
      status: OrderStatus.CANCELLED,
      updated_at: new Date().toISOString(),
    })
    .eq("ngenius_ref", orderRef)
    .neq("status", OrderStatus.CANCELLED)
    .select(
      "id, total, first_name, last_name, delivery_schedule, order_items(name, quantity)",
    )
    .single();

  if (!order) return null;

  const items = (order.order_items ?? []) as Array<{
    name: string;
    quantity: number;
  }>;
  const parts = buildOrderNotificationParts(order, items);
  const title = "Order cancelled";

  await createNotification({
    type: "order_cancelled",
    title,
    message: formatOrderNotificationMessage(order, items),
    relatedId: order.id,
  });

  return { title, parts };
}

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref: orderRef } = await searchParams;

  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      {orderRef && (
        <Suspense fallback={null}>
          <CancelEffects orderRef={orderRef} />
        </Suspense>
      )}
      <CancelCard />
    </main>
  );
}

async function CancelEffects({ orderRef }: { orderRef: string }) {
  const cancelled = await cancelOrder(orderRef);
  return (
    <ResultToast
      success={false}
      title={cancelled?.title ?? null}
      parts={cancelled?.parts ?? null}
      purchase={null}
    />
  );
}

function CancelCard() {
  return (
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
  );
}

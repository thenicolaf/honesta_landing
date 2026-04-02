import webpush from "web-push";
import { supabaseAdmin } from "./supabase.server";
import type { UserRole } from "@/shared/types";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

interface PushPayload {
  title: string;
  body?: string;
  url?: string;
}

interface SendPushParams extends PushPayload {
  audience?: UserRole | null;
  userId?: string | null;
}

const NOTIFICATION_URL_MAP: Record<string, string> = {
  new_order: "/panel/all-orders",
  order_paid: "/panel/all-orders",
  order_failed: "/panel/all-orders",
  order_cancelled: "/panel/all-orders",
  new_partnership: "/panel/partnerships",
  new_promotion: "/?sort=promotions#products",
  new_product: "/#products",
  new_category: "/#categories",
};

export function getNotificationUrl(type: string): string {
  return NOTIFICATION_URL_MAP[type] ?? "/panel";
}

type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

async function getSubscriptions(
  audience?: UserRole | null,
  userId?: string | null,
): Promise<SubscriptionRow[]> {
  // Personal notification — subscriptions for a specific user
  if (userId) {
    const { data } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);
    return data ?? [];
  }

  // Role-targeted notification (e.g., admin-only)
  if (audience) {
    const { data } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, profiles!inner(role)")
      .eq("profiles.role", audience);
    return (data as unknown as SubscriptionRow[]) ?? [];
  }

  // Broadcast (audience = null) — all users who allow notifications
  const { data } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, profiles!inner(allow_notifications)")
    .eq("profiles.allow_notifications", true);
  return (data as unknown as SubscriptionRow[]) ?? [];
}

export async function sendPushNotifications({
  title,
  body,
  url,
  audience,
  userId,
}: SendPushParams): Promise<void> {
  if (!ensureVapid()) return;

  const subscriptions = await getSubscriptions(audience, userId);
  if (!subscriptions.length) return;

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      ),
    ),
  );

  // Clean up expired subscriptions
  const expiredEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        expiredEndpoints.push(subscriptions[i].endpoint);
      } else {
        console.error("[push] Failed to send:", result.reason);
      }
    }
  });

  if (expiredEndpoints.length) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }
}

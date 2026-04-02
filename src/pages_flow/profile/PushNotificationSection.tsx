"use client";

import { useState } from "react";
import { Card, Button, toastInfo } from "@/shared/ui";
import { useNotifications } from "@/providers/notifications";
import { Bell, BellOff, BellRing } from "lucide-react";

export function PushNotificationSection() {
  const { pushState, subscribeToPush, unsubscribeFromPush } =
    useNotifications();
  const [loading, setLoading] = useState(false);

  if (pushState === "unsupported") return null;

  async function handleSubscribe() {
    setLoading(true);
    const success = await subscribeToPush();
    setLoading(false);
    if (success) {
      toastInfo("Push notifications enabled");
    } else {
      toastInfo("Could not enable push notifications");
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    await unsubscribeFromPush();
    setLoading(false);
    toastInfo("Push notifications disabled");
  }

  return (
    <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
      <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-4">
        Push Notifications
      </p>

      {pushState === "subscribed" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-moss shrink-0" />
            <p className="font-body text-sm text-earth">
              Push notifications are enabled on this device
            </p>
          </div>
          <Button
            as="button"
            type="button"
            variant="outline"
            size="sm"
            color="error"
            disabled={loading}
            onClick={handleUnsubscribe}
          >
            {loading ? "Disabling..." : "Disable"}
          </Button>
        </div>
      )}

      {pushState === "prompt" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-earth/50 shrink-0" />
            <p className="font-body text-sm text-earth/70">
              Enable push notifications to receive alerts even when the browser
              is closed
            </p>
          </div>
          <Button
            as="button"
            type="button"
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={handleSubscribe}
          >
            {loading ? "Enabling..." : "Enable"}
          </Button>
        </div>
      )}

      {pushState === "denied" && (
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-earth/40 shrink-0" />
          <p className="font-body text-sm text-earth/60">
            Push notifications are blocked by your browser. To enable them,
            update notification permissions in your browser settings.
          </p>
        </div>
      )}

      {pushState === "granted" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-earth/50 shrink-0" />
            <p className="font-body text-sm text-earth/70">
              Permission granted but not subscribed on this device
            </p>
          </div>
          <Button
            as="button"
            type="button"
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={handleSubscribe}
          >
            {loading ? "Enabling..." : "Enable"}
          </Button>
        </div>
      )}
    </Card>
  );
}

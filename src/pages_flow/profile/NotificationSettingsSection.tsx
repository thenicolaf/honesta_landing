"use client";

import { useState, useTransition } from "react";
import { Card, Checkbox, toastInfo } from "@/shared/ui";
import { toggleNotifications } from "./actions";

interface NotificationSettingsSectionProps {
  defaultChecked: boolean;
}

export function NotificationSettingsSection({
  defaultChecked,
}: NotificationSettingsSectionProps) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-4 md:px-6 md:py-4 lg:p-8 mt-6">
      <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/50 mb-4">
        Notification Settings
      </p>
      <Checkbox
        checked={checked}
        disabled={isPending}
        label="Receive notifications about promotions, new products and categories"
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          startTransition(() => {
            toggleNotifications(next);
          });
          toastInfo(
            next ? "Notifications enabled" : "Notifications disabled",
          );
        }}
      />
    </Card>
  );
}

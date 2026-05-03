"use client";

import { useEffect, useRef } from "react";
import { toastError, toastSuccess } from "@/shared/ui";
import type { OrderNotificationParts } from "@/lib/orderNotifications";

interface ResultToastProps {
  success: boolean;
  title: string | null;
  parts: OrderNotificationParts | null;
}

function ToastBody({
  title,
  parts,
}: {
  title: string;
  parts: OrderNotificationParts;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-body font-semibold text-earth text-sm leading-tight">
        {title}
      </p>
      {parts.customer && (
        <p className="font-body text-2xs text-earth/65">{parts.customer}</p>
      )}
      {parts.itemsText && (
        <p className="font-body text-2xs text-earth/65">
          <span className="text-earth/40">{parts.totalQty} items · </span>
          {parts.itemsText}
        </p>
      )}
      <p className="font-body font-semibold text-2xs text-orange">
        {parts.totalText}
      </p>
      {parts.deliverySchedule && (
        <p className="font-body text-2xs text-earth/55">
          {parts.deliverySchedule}
        </p>
      )}
    </div>
  );
}

export function ResultToast({ success, title, parts }: ResultToastProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !title || !parts) return;
    fired.current = true;
    const body = <ToastBody title={title} parts={parts} />;
    if (success) toastSuccess(body);
    else toastError(body);
  }, [success, title, parts]);

  return null;
}

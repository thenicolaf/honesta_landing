"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/shared/ui";
import { useNotifications } from "@/providers";

export function MarkAllReadButton() {
  const { unreadCount, markAllAsRead } = useNotifications();
  const [loading, setLoading] = useState(false);

  if (unreadCount === 0) return null;

  async function handleClick() {
    setLoading(true);
    await markAllAsRead();
    setLoading(false);
  }

  return (
    <Button
      as="button"
      type="button"
      variant="text"
      size="sm"
      disabled={loading}
      onClick={handleClick}
      className="gap-1.5"
    >
      <CheckCheck className="w-4 h-4" />
      {loading ? "Marking..." : "Mark all as read"}
    </Button>
  );
}

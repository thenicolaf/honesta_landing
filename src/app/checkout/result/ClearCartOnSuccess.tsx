"use client";

import { useEffect } from "react";
import { useCart } from "@/providers";

export function ClearCartOnSuccess({ success }: { success: boolean }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [success, clearCart]);

  return null;
}

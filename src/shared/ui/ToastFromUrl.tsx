"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toastSuccess } from "./Toast";

const MESSAGES: Record<string, string> = {
  created: "Created successfully",
  updated: "Updated successfully",
};

export function ToastFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastParam = searchParams.get("toast");
  const handled = useRef("");

  useEffect(() => {
    if (!toastParam || handled.current === toastParam) return;
    handled.current = toastParam;

    const message = MESSAGES[toastParam];
    if (message) toastSuccess(message);

    // Clean the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [toastParam, router]);

  return null;
}

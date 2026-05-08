"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  trackLogin,
  trackSignUp,
  type AuthMethod,
} from "@/lib/analytics";
import {
  GA_EVENT_PARAM,
  GA_METHOD_PARAM,
} from "@/shared/utils/analyticsParams";

const VALID_METHODS: AuthMethod[] = ["email", "google"];

function isAuthMethod(value: string | null): value is AuthMethod {
  return value !== null && (VALID_METHODS as string[]).includes(value);
}

/**
 * Reads `_ga_event` from URL after server-side redirects (login, signup, OAuth
 * callback) and fires the corresponding GA event. Strips the param from the URL
 * so a refresh doesn't re-fire. Mounted once in root layout.
 */
export function GAEventDispatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fired = useRef<string | null>(null);

  useEffect(() => {
    const event = searchParams.get(GA_EVENT_PARAM);
    if (!event) return;

    const fireKey = `${pathname}?${searchParams.toString()}`;
    if (fired.current === fireKey) return;
    fired.current = fireKey;

    const methodRaw = searchParams.get(GA_METHOD_PARAM);
    const method = isAuthMethod(methodRaw) ? methodRaw : "email";

    if (event === "login") trackLogin(method);
    else if (event === "sign_up") trackSignUp(method);

    const stripped = new URLSearchParams(searchParams.toString());
    stripped.delete(GA_EVENT_PARAM);
    stripped.delete(GA_METHOD_PARAM);
    const query = stripped.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, searchParams, router]);

  return null;
}

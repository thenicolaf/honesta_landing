"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { urlBase64ToUint8Array } from "../utils";
import { PUSH_OPT_OUT_KEY } from "@/shared/consts";
import type { PushState } from "../types";

function getVapidKey(): Uint8Array<ArrayBuffer> {
  return urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
}

async function createPushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: getVapidKey(),
  });
}

async function saveSubscription(sub: PushSubscription): Promise<boolean> {
  const res = await fetch("/api/push-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return res.ok;
}

async function deleteSubscription(endpoint: string): Promise<void> {
  await fetch("/api/push-subscription", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}

async function resolveInitialPushState(
  registration: ServiceWorkerRegistration,
  active: boolean,
): Promise<PushState> {
  const permission = Notification.permission;
  if (permission === "denied") return "denied";

  const existing = await registration.pushManager.getSubscription();
  if (existing) return "subscribed";

  if (permission === "granted" && active && !localStorage.getItem(PUSH_OPT_OUT_KEY)) {
    try {
      const sub = await createPushSubscription(registration);
      await saveSubscription(sub);
      return "subscribed";
    } catch {
      return "prompt";
    }
  }

  return "prompt";
}

export function useServiceWorker(
  active: boolean,
  setPushState: Dispatch<SetStateAction<PushState>>,
) {
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        swRegistrationRef.current = registration;
        const state = await resolveInitialPushState(registration, active);
        setPushState(state);
      })
      .catch(() => setPushState("unsupported"));
  }, [active, setPushState]);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    const registration = swRegistrationRef.current;
    if (!registration) return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushState("denied");
      return false;
    }

    try {
      const sub = await createPushSubscription(registration);
      const ok = await saveSubscription(sub);
      if (!ok) return false;
      localStorage.removeItem(PUSH_OPT_OUT_KEY);
      setPushState("subscribed");
      return true;
    } catch {
      return false;
    }
  }, [setPushState]);

  const unsubscribeFromPush = useCallback(async () => {
    const registration = swRegistrationRef.current;
    if (!registration) return;

    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await deleteSubscription(endpoint);
    }
    localStorage.setItem(PUSH_OPT_OUT_KEY, "1");
    setPushState("prompt");
  }, [setPushState]);

  return { subscribeToPush, unsubscribeFromPush };
}

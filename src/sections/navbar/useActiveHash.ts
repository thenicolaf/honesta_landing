"use client";

import { useSyncExternalStore } from "react";

function getHash() {
  return typeof window !== "undefined" ? window.location.hash : "";
}

function subscribe(cb: () => void) {
  // Listen for popstate (back/forward) and hashchange
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);

  // HashTracker uses replaceState which doesn't fire events —
  // poll at low frequency to catch those updates
  const interval = setInterval(cb, 300);

  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
    clearInterval(interval);
  };
}

export function useActiveHash() {
  return useSyncExternalStore(subscribe, getHash, () => "");
}

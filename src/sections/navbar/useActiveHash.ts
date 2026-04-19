"use client";

import { useSyncExternalStore } from "react";

function getHash() {
  return typeof window !== "undefined" ? window.location.hash : "";
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
}

export function useActiveHash() {
  return useSyncExternalStore(subscribe, getHash, () => "");
}

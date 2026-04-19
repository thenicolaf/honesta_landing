"use client";

import { useEffect } from "react";
import { SECTION_IDS } from "@/shared/consts/navLinks";

export function HashTracker() {
  useEffect(() => {
    let currentHash = window.location.hash;
    const tracked = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const id = entry.target.id;
          const newHash = id === "hero" ? "" : `#${id}`;

          if (currentHash !== newHash) {
            currentHash = newHash;
            const base = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", newHash ? `${base}${newHash}` : base);
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }
        }
      },
      { rootMargin: "-30% 0px -70% 0px" },
    );

    function trackSections(): boolean {
      for (const id of SECTION_IDS) {
        if (tracked.has(id)) continue;
        const el = document.getElementById(id);
        if (el) {
          tracked.add(id);
          io.observe(el);
        }
      }
      return tracked.size === SECTION_IDS.length;
    }

    // Watch for Suspense-deferred sections appearing in the DOM
    let mo: MutationObserver | undefined;
    if (!trackSections()) {
      mo = new MutationObserver(() => {
        if (trackSections()) mo!.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => mo!.disconnect(), 5000);
    }

    return () => {
      io.disconnect();
      mo?.disconnect();
    };
  }, []);

  return null;
}

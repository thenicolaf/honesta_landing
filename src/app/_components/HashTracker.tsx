"use client";

import { useEffect } from "react";

const SECTION_IDS = ["hero", "categories", "products", "story", "contact"];

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
          }
        }
      },
      { rootMargin: "-30% 0px -70% 0px" },
    );

    function trackSections() {
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

    // Retry until all sections found (Suspense sections may hydrate later)
    if (!trackSections()) {
      const retryId = setInterval(() => {
        if (trackSections()) clearInterval(retryId);
      }, 200);
      setTimeout(() => clearInterval(retryId), 5000);
    }

    return () => io.disconnect();
  }, []);

  return null;
}

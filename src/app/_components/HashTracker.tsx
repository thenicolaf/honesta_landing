"use client";

import { useEffect } from "react";

const SECTION_IDS = ["hero", "categories", "products", "story", "contact"];

export function HashTracker() {
  useEffect(() => {
    const initialHash = window.location.hash;
    let currentHash = initialHash;
    let suppressUpdates = !!initialHash;
    let scrolledToTarget = false;
    const tracked = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const id = entry.target.id;

          // Target section entered viewport — scroll succeeded, resume tracking
          if (suppressUpdates && `#${id}` === initialHash) {
            suppressUpdates = false;
            scrolledToTarget = true;
          }

          // Don't update URL while waiting to scroll to initial hash
          if (suppressUpdates) continue;

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

    function scrollToInitialHash() {
      if (scrolledToTarget || !initialHash) return;
      const el = document.getElementById(initialHash.slice(1));
      if (el) {
        scrolledToTarget = true;
        el.scrollIntoView({ behavior: "instant" });
      }
    }

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

    // Initial attempt
    trackSections();
    scrollToInitialHash();

    // Retry for Suspense-deferred sections
    if (!trackSections() || (initialHash && !scrolledToTarget)) {
      const retryId = setInterval(() => {
        trackSections();
        scrollToInitialHash();
        if (tracked.size === SECTION_IDS.length && (!initialHash || scrolledToTarget)) {
          clearInterval(retryId);
        }
      }, 200);
      setTimeout(() => clearInterval(retryId), 5000);
    }

    // Safety: stop suppressing after 3s if target never appeared
    const safetyTimer = suppressUpdates
      ? setTimeout(() => { suppressUpdates = false; }, 3000)
      : undefined;

    return () => {
      io.disconnect();
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  return null;
}

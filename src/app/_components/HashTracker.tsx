"use client";

import { useEffect } from "react";

const SECTION_IDS = ["hero", "categories", "products", "story", "contact"];

export function HashTracker() {
  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    let currentHash = window.location.hash;

    // Observe a narrow strip at 30% from top of viewport.
    // When a section's top edge crosses this strip, it becomes active.
    // This works for any section height, including very tall ones.
    const observer = new IntersectionObserver(
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
      {
        // Collapse viewport to a 1px line at ~30% from top:
        // top margin = -30%, bottom margin = -70% + 1px
        rootMargin: "-30% 0px -70% 0px",
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}

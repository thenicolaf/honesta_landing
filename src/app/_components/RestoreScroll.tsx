"use client";

import { useEffect } from "react";

export function RestoreScroll() {
  useEffect(() => {
    const key = `scroll:${window.location.pathname}${window.location.hash}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) return;

    const y = Number(saved);
    if (!y || y <= 0) return;

    // Remove immediately so it doesn't restore on subsequent navigations
    sessionStorage.removeItem(key);

    // Wait for content to render, then restore scroll
    // Use requestAnimationFrame chain to ensure layout is complete
    let attempts = 0;
    const maxAttempts = 30; // ~500ms at 60fps

    const tryRestore = () => {
      attempts++;
      // Only restore if page is tall enough
      if (document.documentElement.scrollHeight >= y + window.innerHeight * 0.5) {
        window.scrollTo(0, y);
        return;
      }
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryRestore);
      }
    };

    requestAnimationFrame(tryRestore);
  }, []);

  return null;
}

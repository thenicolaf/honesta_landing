"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial render — page loads handle their own scroll
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Don't scroll if there's a hash — HashLink handles that
    if (window.location.hash) return;

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

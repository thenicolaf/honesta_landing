import { useRef, useEffect, useCallback } from "react";

export interface ScrollWheelItem {
  value: string;
  label: string;
}

interface UseScrollWheelOptions {
  items: ScrollWheelItem[];
  value: string;
  onValueChange: (value: string) => void;
  itemHeight: number;
  visibleCount: number;
}

/**
 * Manages iOS-style scroll wheel mechanics:
 * - CSS scroll-snap for native snap-to-center behavior
 * - Direct DOM manipulation for fish-eye visual effects (no React re-renders per frame)
 * - scrollend / debounce fallback for selection finalization
 * - Initial scroll positioning on mount
 */
export function useScrollWheel({
  items,
  value,
  onValueChange,
  itemHeight,
  visibleCount,
}: UseScrollWheelOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const paddingHeight = Math.floor(visibleCount / 2) * itemHeight;

  // ─── Visual effects ──────────────────────────────────────────────────

  const applyVisualEffects = useCallback(
    (scrollTop: number) => {
      const center = scrollTop / itemHeight;

      for (let i = 0; i < items.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const distance = Math.abs(i - center);

        let opacity: number;
        let scale: number;
        let fontWeight: string;

        if (distance < 0.5) {
          opacity = 1;
          scale = 1;
          fontWeight = "600";
        } else if (distance < 1.5) {
          opacity = 0.5;
          scale = 0.95;
          fontWeight = "400";
        } else {
          opacity = 0.3;
          scale = 0.88;
          fontWeight = "400";
        }

        el.style.opacity = String(opacity);
        el.style.transform = `scale(${scale})`;
        el.style.fontWeight = fontWeight;
      }
    },
    [items.length, itemHeight],
  );

  // ─── Scroll handler (RAF-throttled) ──────────────────────────────────

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      applyVisualEffects(el.scrollTop);
    });
  }, [applyVisualEffects]);

  // ─── Selection finalization ──────────────────────────────────────────

  const finalizeSelection = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const centerIndex = Math.round(el.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(centerIndex, items.length - 1));
    const item = items[clamped];

    if (item && item.value !== valueRef.current) {
      onValueChange(item.value);
    }
  }, [items, itemHeight, onValueChange]);

  // ─── Event listeners ─────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      handleScroll();

      // Debounce fallback for browsers without scrollend
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(finalizeSelection, 150);
    };

    const onScrollEnd = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      finalizeSelection();
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const hasScrollEnd = "onscrollend" in window;
    if (hasScrollEnd) {
      el.addEventListener("scrollend", onScrollEnd);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (hasScrollEnd) {
        el.removeEventListener("scrollend", onScrollEnd);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handleScroll, finalizeSelection]);

  // ─── Initial scroll + visual effects on mount ────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const index = items.findIndex((item) => item.value === value);
    const targetIndex = index >= 0 ? index : 0;

    requestAnimationFrame(() => {
      el.scrollTo({ top: targetIndex * itemHeight, behavior: "instant" });
      applyVisualEffects(targetIndex * itemHeight);
    });
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, itemRefs, paddingHeight } as const;
}

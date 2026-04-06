import { useRef, useEffect, useCallback, useLayoutEffect } from "react";

export interface ScrollWheelItem {
  value: string;
  label: string;
  disabled?: boolean;
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
  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

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

  // Find the nearest non-disabled item index, searching outward from `index`.
  const findNearestEnabledIndex = useCallback(
    (index: number): number => {
      if (items[index] && !items[index].disabled) return index;
      for (let offset = 1; offset < items.length; offset++) {
        const up = index - offset;
        const down = index + offset;
        if (down < items.length && !items[down].disabled) return down;
        if (up >= 0 && !items[up].disabled) return up;
      }
      return index;
    },
    [items],
  );

  const finalizeSelection = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const centerIndex = Math.round(el.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(centerIndex, items.length - 1));
    const targetIndex = findNearestEnabledIndex(clamped);
    const item = items[targetIndex];

    if (!item) return;

    // If the nearest enabled differs from where we landed, smooth-scroll to it
    if (targetIndex !== clamped) {
      el.scrollTo({ top: targetIndex * itemHeight, behavior: "smooth" });
    }

    if (item.value !== valueRef.current) {
      onValueChange(item.value);
    }
  }, [items, itemHeight, onValueChange, findNearestEnabledIndex]);

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

    // Normalize mouse wheel to exactly one item per tick.
    // Trackpads (Mac) and precision wheels send small deltaY (<50px) — we let them
    // scroll natively. Physical mouse wheels send deltaY ≈ 100 which would skip
    // multiple items — we intercept and scroll by exactly one itemHeight.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 50) return; // trackpad / precision — native scroll
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      el.scrollBy({ top: direction * itemHeight, behavior: "smooth" });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });

    const hasScrollEnd = "onscrollend" in window;
    if (hasScrollEnd) {
      el.addEventListener("scrollend", onScrollEnd);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      if (hasScrollEnd) {
        el.removeEventListener("scrollend", onScrollEnd);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handleScroll, finalizeSelection, itemHeight]);

  // ─── Sync scroll position with `value` prop ─────────────────────────
  // Runs on mount AND when `value` changes externally. If the wheel is
  // already centered on the target item (within half an item), we skip —
  // that means the change originated from our own scroll finalization.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const index = items.findIndex((item) => item.value === value);
    const targetIndex = index >= 0 ? index : 0;
    const targetScrollTop = targetIndex * itemHeight;

    // Skip if already at target (user-driven update)
    if (Math.abs(el.scrollTop - targetScrollTop) < itemHeight / 2) {
      applyVisualEffects(el.scrollTop);
      return;
    }

    requestAnimationFrame(() => {
      el.scrollTo({ top: targetScrollTop, behavior: "instant" });
      applyVisualEffects(targetScrollTop);
    });
  }, [value, items, itemHeight, applyVisualEffects]);

  // Scroll to a specific item index with smooth animation.
  // Skips disabled items by finding the nearest enabled one.
  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      const target = findNearestEnabledIndex(clamped);
      el.scrollTo({ top: target * itemHeight, behavior: "smooth" });
    },
    [items.length, itemHeight, findNearestEnabledIndex],
  );

  // Keyboard navigation: arrows = ±1, PageUp/Down = ±5, Home/End = edges
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;

      const currentIndex = Math.round(el.scrollTop / itemHeight);
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
          nextIndex = currentIndex + 1;
          break;
        case "ArrowUp":
          nextIndex = currentIndex - 1;
          break;
        case "PageDown":
          nextIndex = currentIndex + 5;
          break;
        case "PageUp":
          nextIndex = currentIndex - 5;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      scrollToIndex(nextIndex);
    },
    [itemHeight, items.length, scrollToIndex],
  );

  return {
    containerRef,
    itemRefs,
    paddingHeight,
    scrollToIndex,
    handleKeyDown,
  } as const;
}

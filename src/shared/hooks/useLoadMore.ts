"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export function useLoadMore<T>(items: T[], pageSize = 10) {
  // Create a stable identity key that changes when items change
  const itemsKey = useMemo(() => items, [items]);
  const [state, setState] = useState({ key: itemsKey, count: pageSize });

  // Reset count when items change (derived state pattern)
  const visibleCount =
    state.key === itemsKey ? state.count : pageSize;

  if (state.key !== itemsKey) {
    setState({ key: itemsKey, count: pageSize });
  }

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      count: Math.min(prev.count + pageSize, items.length),
    }));
  }, [items.length, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    sentinelRef,
  };
}

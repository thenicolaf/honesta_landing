"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { DragDropProvider, PointerSensor } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { toast } from "react-toastify";
import { cn } from "@/shared/utils/cn";
import type { DbCategory } from "@/sections/categories/types";
import { ADMIN_CATEGORY_GRID_CLASS } from "@/sections/categories/CategoryGridSkeleton";
import { AdminCategoryCard } from "./AdminCategoryCard";
import { reorderCategories } from "./actions";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SortableCategoryCard({
  category,
  index,
}: {
  category: DbCategory;
  index: number;
}) {
  const handleElRef = useRef<HTMLButtonElement>(null);
  const { ref, isDragging } = useSortable({
    id: category.id,
    index,
    handle: handleElRef,
    sensors: [
      {
        plugin: PointerSensor,
        options: {
          activationConstraints: () => undefined,
        },
      },
    ],
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group h-full transition-opacity duration-150",
        isDragging && "opacity-40",
      )}
    >
      <AdminCategoryCard category={category} dragHandleRef={handleElRef} />
    </div>
  );
}

export function SortableCategoryGrid({
  categories,
}: {
  categories: DbCategory[];
}) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    categories,
    (_current: DbCategory[], reordered: DbCategory[]) => reordered,
  );

  function handleDragEnd(
    event: Parameters<
      NonNullable<
        React.ComponentProps<typeof DragDropProvider>["onDragEnd"]
      >
    >[0],
  ) {
    const { source } = event.operation;

    if (source && isSortable(source)) {
      const from = source.initialIndex;
      const to = source.index;
      if (from !== to) {
        const reordered = moveItem(optimistic, from, to);

        startTransition(async () => {
          setOptimistic(reordered);
          const result = await reorderCategories(reordered.map((c) => c.id));
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success("Category order updated");
          }
        });
      }
    }
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={ADMIN_CATEGORY_GRID_CLASS}>
        {optimistic.map((category, index) => (
          <SortableCategoryCard
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}

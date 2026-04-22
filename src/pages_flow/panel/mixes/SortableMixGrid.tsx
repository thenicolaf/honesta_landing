"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { DragDropProvider, PointerSensor } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { toast } from "react-toastify";
import { cn } from "@/shared/utils/cn";
import type { MixBox } from "@/lib/mixBoxesDb";
import { reorderMixesAction } from "./actions";
import { MixCard } from "./MixCard";
import { ADMIN_MIX_GRID_CLASS } from "./MixesSkeleton";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SortableMixItem({ mix, index }: { mix: MixBox; index: number }) {
  const handleElRef = useRef<HTMLButtonElement>(null);
  const { ref, isDragging } = useSortable({
    id: mix.id,
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
      <MixCard mix={mix} dragHandleRef={handleElRef} />
    </div>
  );
}

export function SortableMixGrid({ mixes }: { mixes: MixBox[] }) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    mixes,
    (_current: MixBox[], reordered: MixBox[]) => reordered,
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
          const result = await reorderMixesAction(reordered.map((m) => m.id));
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success("Mix order updated");
          }
        });
      }
    }
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={ADMIN_MIX_GRID_CLASS}>
        {optimistic.map((mix, index) => (
          <SortableMixItem key={mix.id} mix={mix} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

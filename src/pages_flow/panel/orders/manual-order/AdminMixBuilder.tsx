"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGrid, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
  EmptyState,
} from "@/shared/ui";
import { formatAed } from "@/shared/ui/Table";
import { BoxSelector } from "@/pages_flow/mix/BoxSelector";
import { PresetGrid } from "@/pages_flow/mix/PresetGrid";
import type { MixBox, MixPreset } from "@/lib/mixBoxesDb";

export interface PendingMix {
  id: string;
  boxId: string;
  selections: { presetId: string; count: number }[];
}

interface Props {
  boxes: MixBox[];
  mixes: PendingMix[];
  onChange: (mixes: PendingMix[]) => void;
}

function toSelections(counts: Map<string, number>) {
  return Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .map(([presetId, count]) => ({ presetId, count }));
}

function calcMixTotals(
  box: MixBox,
  selections: { presetId: string; count: number }[],
) {
  let price = 0;
  let weight = 0;
  for (const s of selections) {
    const preset = box.presets.find((p) => p.id === s.presetId);
    if (!preset) continue;
    price += Number(preset.price) * s.count;
    weight += preset.weight_g * s.count;
  }
  return { price, weight };
}

function randomId() {
  return (
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function AdminMixBuilder({ boxes, mixes, onChange }: Props) {
  const [activeBoxId, setActiveBoxId] = useState<string>("");
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  const activeBox = useMemo(
    () => boxes.find((b) => b.id === activeBoxId) ?? null,
    [boxes, activeBoxId],
  );

  const totalCells = useMemo(() => {
    let n = 0;
    for (const v of counts.values()) n += v;
    return n;
  }, [counts]);

  const cellCount = activeBox?.cell_count ?? 0;
  const isComplete = activeBox != null && totalCells === cellCount;

  const draftTotals = useMemo(() => {
    if (!activeBox) return { price: 0, weight: 0 };
    return calcMixTotals(activeBox, toSelections(counts));
  }, [activeBox, counts]);

  function handleSelectBox(id: string) {
    setActiveBoxId(id === activeBoxId ? "" : id);
    setCounts(new Map());
  }

  function handleAddPreset(presetId: string) {
    if (!activeBox || totalCells >= cellCount) return;
    setCounts((prev) => {
      const next = new Map(prev);
      next.set(presetId, (next.get(presetId) ?? 0) + 1);
      return next;
    });
  }

  function handleRemovePreset(presetId: string) {
    setCounts((prev) => {
      const current = prev.get(presetId) ?? 0;
      if (current <= 0) return prev;
      const next = new Map(prev);
      if (current === 1) next.delete(presetId);
      else next.set(presetId, current - 1);
      return next;
    });
  }

  function handleAddToOrder() {
    if (!activeBox || !isComplete) return;
    const selections = toSelections(counts);
    onChange([
      ...mixes,
      { id: randomId(), boxId: activeBox.id, selections },
    ]);
    setCounts(new Map());
    setActiveBoxId("");
  }

  function handleRemoveMix(id: string) {
    onChange(mixes.filter((m) => m.id !== id));
  }

  if (boxes.length === 0) {
    return (
      <EmptyState
        label="No active mix boxes"
        description="Create a mix box in /panel/mixes to enable this section."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <BoxSelector
        boxes={boxes}
        selectedId={activeBoxId}
        onSelect={handleSelectBox}
      />

      <Collapsible open={!!activeBox}>
        <CollapsibleContent>
          {activeBox && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55">
                  Fill cells · {totalCells} / {cellCount}
                </p>
                {totalCells > 0 && (
                  <p className="font-body font-semibold text-heading text-sm whitespace-nowrap">
                    {formatAed(draftTotals.price)} · {draftTotals.weight}g
                  </p>
                )}
              </div>

              <PresetGrid
                presets={activeBox.presets}
                counts={counts}
                canAdd={totalCells < cellCount}
                onAdd={handleAddPreset}
                onRemove={handleRemovePreset}
              />

              <div className="flex items-center justify-end gap-3">
                {totalCells > 0 && (
                  <Button
                    as="button"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCounts(new Map())}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  as="button"
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!isComplete}
                  onClick={handleAddToOrder}
                >
                  Add mix to order
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {mixes.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t border-earth/8">
          <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 pt-3">
            Mixes in this order
          </p>
          {mixes.map((m) => {
            const box = boxes.find((b) => b.id === m.boxId);
            if (!box) return null;
            const totals = calcMixTotals(box, m.selections);
            return (
              <PendingMixCard
                key={m.id}
                box={box}
                selections={m.selections}
                price={totals.price}
                weight={totals.weight}
                onRemove={() => handleRemoveMix(m.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PendingMixCardProps {
  box: MixBox;
  selections: { presetId: string; count: number }[];
  price: number;
  weight: number;
  onRemove: () => void;
}

function PendingMixCard({
  box,
  selections,
  price,
  weight,
  onRemove,
}: PendingMixCardProps) {
  const totalCount = selections.reduce((sum, s) => sum + s.count, 0);
  const presetMap = new Map(box.presets.map((p) => [p.id, p] as const));

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 sm:p-4 rounded-xl bg-sand/40">
      <div className="flex items-start gap-3 min-w-0 sm:flex-1">
        <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-sand">
          {box.image_url ? (
            <Image
              src={box.image_url}
              alt={box.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-earth/25">
              <LayoutGrid size={20} />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 gap-1 flex-1">
          <p className="font-body font-medium text-sm text-heading truncate">
            {box.name}
          </p>
          <p className="font-body font-light text-xs text-earth/55">
            {weight}g · {formatAed(price)}
          </p>
          <Collapsible className="mt-1">
            <CollapsibleTrigger className="inline-flex items-center gap-1.5 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors">
              Composition · {totalCount} items
              <CollapsibleChevron />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-wrap gap-x-1.5 gap-y-1.5 mt-2 pr-2">
                {selections.map((s) => {
                  const preset = presetMap.get(s.presetId) as MixPreset | undefined;
                  return (
                    <div key={s.presetId} className="relative">
                      <Badge variant="outline" size="xs">
                        {preset?.product?.title ?? "—"}
                      </Badge>
                      <Badge
                        variant="counter"
                        size="pill"
                        className="absolute -top-1.5 -right-1.5"
                      >
                        {s.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="flex sm:items-center sm:h-16 justify-end">
        <Button
          as="button"
          type="button"
          variant="text"
          size="icon"
          color="error"
          onClick={onRemove}
          aria-label="Remove mix"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

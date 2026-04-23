"use client";

import { useMemo, useTransition } from "react";
import { useFilterBar, useFilterBarMulti } from "@/providers/FilterProvider";
import { useCart } from "@/providers/cart/CartProvider";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  toastError,
  toastSuccess,
} from "@/shared/ui";
import { ShoppingBag } from "lucide-react";
import type { MixBox } from "@/lib/mixBoxesDb";
import { BoxSelector } from "./BoxSelector";
import { PresetGrid } from "./PresetGrid";
import { MixSummary } from "./MixSummary";
import { assembleMixAction } from "./actions";

interface MixBuilderPageProps {
  boxes: MixBox[];
}

export function MixBuilderPage({ boxes }: MixBuilderPageProps) {
  const boxFilter = useFilterBar("box");
  const presetFilter = useFilterBarMulti("preset");
  const {
    addToCart,
    items,
    updateItemQuantity,
    removeFromCart,
    isHydrated,
  } = useCart();
  const [isPending, startTransition] = useTransition();

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === boxFilter.value) ?? null,
    [boxes, boxFilter.value],
  );

  const presetValues = presetFilter.values;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const id of presetValues) {
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [presetValues]);

  const totalCells = presetValues.length;
  const cellCount = selectedBox?.cell_count ?? 0;
  const isFull = totalCells >= cellCount;
  const isComplete = totalCells === cellCount;

  const totalPrice = useMemo(() => {
    if (!selectedBox) return 0;
    let sum = 0;
    for (const [presetId, count] of counts) {
      const preset = selectedBox.presets.find((p) => p.id === presetId);
      if (preset) sum += Number(preset.price) * count;
    }
    return sum;
  }, [selectedBox, counts]);

  const totalWeight = useMemo(() => {
    if (!selectedBox) return 0;
    let sum = 0;
    for (const [presetId, count] of counts) {
      const preset = selectedBox.presets.find((p) => p.id === presetId);
      if (preset) sum += preset.weight_g * count;
    }
    return sum;
  }, [selectedBox, counts]);

  function handleSelectBox(id: string) {
    boxFilter.onValueChange(id === boxFilter.value ? "" : id);
    presetFilter.onValuesChange([]);
  }

  function handleAddPreset(presetId: string) {
    if (isFull) return;
    presetFilter.onValuesChange([...presetValues, presetId]);
  }

  function handleRemovePreset(presetId: string) {
    const idx = presetValues.indexOf(presetId);
    if (idx === -1) return;
    const next = [...presetValues];
    next.splice(idx, 1);
    presetFilter.onValuesChange(next);
  }

  function handleAddToCart() {
    if (!selectedBox || !isComplete) return;

    const selections = Array.from(counts.entries()).map(
      ([presetId, count]) => ({
        presetId,
        count,
      }),
    );

    startTransition(async () => {
      const result = await assembleMixAction(selectedBox.id, selections);
      if ("error" in result) {
        toastError(result.error);
        return;
      }
      addToCart(result.cartItem);
      toastSuccess(`${selectedBox.name} added to cart`);
      presetFilter.onValuesChange([]);
      boxFilter.onValueChange("");
    });
  }

  const mixCartItems = items.filter((i) => i.isMix);

  function handleClearAllMixes() {
    for (const item of mixCartItems) {
      removeFromCart(item.variantId);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Box selection */}
      <section>
        <h2 className="font-display font-semibold text-heading text-xl sm:text-2xl mb-5">
          Choose your box
        </h2>
        <BoxSelector
          boxes={boxes}
          selectedId={boxFilter.value}
          onSelect={handleSelectBox}
        />
      </section>

      {/* Preset selection — collapsible under boxes */}
      <Collapsible open={!!selectedBox}>
        <CollapsibleContent>
          {selectedBox && (
            <section>
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display font-semibold text-heading text-xl sm:text-2xl">
                    Fill your cells
                  </h2>
                  <p className="font-body font-light text-earth/60 text-sm mt-1">
                    {totalCells} / {cellCount} cells filled
                  </p>
                </div>
                {totalCells > 0 && (
                  <p className="font-body font-semibold text-heading text-sm sm:text-base whitespace-nowrap">
                    AED {totalPrice.toFixed(2)} · {totalWeight}g
                  </p>
                )}
              </div>

              <PresetGrid
                presets={selectedBox.presets}
                counts={counts}
                canAdd={!isFull}
                onAdd={handleAddPreset}
                onRemove={handleRemovePreset}
              />

              <div className="flex items-center justify-end gap-3 mt-6">
                {totalCells > 0 && (
                  <Button
                    as="button"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => presetFilter.onValuesChange([])}
                    className="lg:h-11! lg:px-6! lg:text-sm! lg:tracking-[0.12em]!"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  as="button"
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!isComplete || isPending}
                  onClick={handleAddToCart}
                  startIcon={<ShoppingBag size={14} />}
                  className="lg:h-11! lg:px-6! lg:text-sm! lg:tracking-[0.12em]!"
                >
                  {isPending ? "Adding…" : "Add to cart"}
                </Button>
              </div>
            </section>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Summary of mix items in cart — shown regardless of selected box */}
      <MixSummary
        items={mixCartItems}
        isHydrated={isHydrated}
        onUpdateQuantity={updateItemQuantity}
        onRemove={removeFromCart}
        onClearAll={handleClearAllMixes}
      />
    </div>
  );
}

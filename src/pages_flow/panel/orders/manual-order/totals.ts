import type { Product } from "@/sections/products/types/types";
import type { MixBox } from "@/lib/mixBoxesDb";
import type { DeliverySetting } from "@/lib/deliveryDb";
import {
  calculateDelivery,
  type DeliveryResult,
} from "@/shared/utils/calculateDelivery";
import type { ItemRow } from "./OrderItemsPicker";
import type { PendingMix } from "./AdminMixBuilder";

export interface ManualOrderTotals {
  subtotal: number;
  promotionDiscount: number;
  delivery: DeliveryResult;
  total: number;
}

interface BuildTotalsArgs {
  rows: ItemRow[];
  mixes: PendingMix[];
  products: Product[];
  boxes: MixBox[];
  deliverySettings: DeliverySetting[];
  emirate: string;
}

function reduceProductRows(
  rows: ItemRow[],
  productMap: Map<string, Product>,
): { subtotal: number; promotionDiscount: number } {
  let subtotal = 0;
  let promotionDiscount = 0;
  for (const r of rows) {
    if (!r.variantId || r.quantity <= 0) continue;
    const product = productMap.get(r.productId);
    const variant = product?.variants.find((v) => v.id === r.variantId);
    if (!product || !variant) continue;
    const originalPrice = variant.price;
    const finalPrice = product.promotion
      ? product.promotion.discountedPrice
      : originalPrice;
    subtotal += finalPrice * r.quantity;
    promotionDiscount += (originalPrice - finalPrice) * r.quantity;
  }
  return { subtotal, promotionDiscount };
}

function reduceMixRows(
  mixes: PendingMix[],
  boxMap: Map<string, MixBox>,
): number {
  let subtotal = 0;
  for (const m of mixes) {
    const box = boxMap.get(m.boxId);
    if (!box) continue;
    for (const s of m.selections) {
      const preset = box.presets.find((p) => p.id === s.presetId);
      if (!preset) continue;
      subtotal += Number(preset.price) * s.count;
    }
  }
  return subtotal;
}

export function buildManualOrderTotals({
  rows,
  mixes,
  products,
  boxes,
  deliverySettings,
  emirate,
}: BuildTotalsArgs): ManualOrderTotals {
  const productMap = new Map(products.map((p) => [p.id ?? "", p]));
  const boxMap = new Map(boxes.map((b) => [b.id, b]));

  const { subtotal: productSubtotal, promotionDiscount } = reduceProductRows(
    rows,
    productMap,
  );
  const mixSubtotal = reduceMixRows(mixes, boxMap);
  const subtotal = productSubtotal + mixSubtotal;

  const delivery = calculateDelivery(subtotal, emirate, deliverySettings);
  const total = subtotal + delivery.fee;

  return { subtotal, promotionDiscount, delivery, total };
}

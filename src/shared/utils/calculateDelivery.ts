import type { DeliverySetting } from "@/lib/deliveryDb";

export interface DeliveryResult {
  fee: number;
  isFreeDelivery: boolean;
  minimumOrder: number | null;
  belowMinimum: boolean;
  deliveryDays: number;
}

/**
 * Pure function — works on both client and server.
 * Returns the delivery fee and validation flags for a given emirate + subtotal.
 */
export function calculateDelivery(
  subtotal: number,
  emirate: string,
  settings: DeliverySetting[],
): DeliveryResult {
  const rule = settings.find(
    (s) => s.emirate.toLowerCase() === emirate.toLowerCase(),
  );

  // Emirate not found — use the most restrictive active setting as fallback
  if (!rule) {
    const active = settings.filter((s) => s.is_active);
    const fallback = active.length > 0
      ? active.reduce((max, s) => (s.delivery_fee > max.delivery_fee ? s : max))
      : null;

    if (!fallback) {
      return { fee: 0, isFreeDelivery: false, minimumOrder: null, belowMinimum: false, deliveryDays: 1 };
    }

    const belowMin = fallback.minimum_order != null && subtotal < fallback.minimum_order;
    return {
      fee: fallback.delivery_fee,
      isFreeDelivery: false,
      minimumOrder: fallback.minimum_order,
      belowMinimum: belowMin,
      deliveryDays: fallback.delivery_days,
    };
  }

  const belowMinimum =
    rule.minimum_order != null && subtotal < rule.minimum_order;

  const isFreeDelivery =
    rule.free_delivery_threshold != null &&
    subtotal >= rule.free_delivery_threshold;

  return {
    fee: isFreeDelivery ? 0 : rule.delivery_fee,
    isFreeDelivery,
    minimumOrder: rule.minimum_order,
    belowMinimum,
    deliveryDays: rule.delivery_days,
  };
}

/** Formats delivery days for display. */
export function formatDeliveryDays(days: number): string {
  if (days === 0) return "Same day delivery";
  if (days === 1) return "Next day delivery";
  return `Delivery in ${days} days`;
}

/** Formats delivery days range from multiple settings. */
export function formatDeliveryDaysRange(settings: DeliverySetting[]): string {
  const active = settings.filter((s) => s.is_active);
  if (active.length === 0) return "Delivery available";
  const days = active.map((s) => s.delivery_days);
  const min = Math.min(...days);
  const max = Math.max(...days);
  if (min === max) return formatDeliveryDays(min);
  if (min === 0) return `Same day – ${max} day delivery`;
  return `${min}–${max} day delivery`;
}

/** Returns the min and max delivery fees from all active settings. */
export function getDeliveryFeeRange(settings: DeliverySetting[]): {
  min: number;
  max: number;
} {
  const active = settings.filter((s) => s.is_active);
  if (active.length === 0) return { min: 0, max: 0 };

  const fees = active.map((s) => s.delivery_fee);
  return { min: Math.min(...fees), max: Math.max(...fees) };
}

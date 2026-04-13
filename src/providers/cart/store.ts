import type { CartItem } from "@/sections/products/types";
import type { AppliedPromoCode } from "@/lib/promoCodeApply";

// ─── External cart store ───────────────────────────────────────────────────────

const EMPTY: CartItem[] = [];
let _items: CartItem[] = EMPTY;
let _isHydrated = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

export function getSnapshot() {
  return _items;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function getHydratedSnapshot() {
  return _isHydrated;
}

export function getHydratedServerSnapshot() {
  return false;
}

export function setStore(items: CartItem[]) {
  _items = items;
  _isHydrated = true;
  notify();
}

export function resetStore() {
  _items = EMPTY;
  _isHydrated = false;
  notify();
}

export function getItems() {
  return _items;
}

// ─── Promo code persistence ───────────────────────────────────────────────────

const PROMO_CODE_STORAGE_KEY = "honesta_promo_code";

export function loadStoredPromo(): AppliedPromoCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROMO_CODE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppliedPromoCode;
    if (parsed && typeof parsed.id === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function storePromo(promo: AppliedPromoCode | null) {
  if (typeof window === "undefined") return;
  if (promo) {
    window.localStorage.setItem(PROMO_CODE_STORAGE_KEY, JSON.stringify(promo));
  } else {
    window.localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  }
}

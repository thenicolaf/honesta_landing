import type { CartItem } from "@/sections/products/types/types";

const CART_KEY = "honesta_cart";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addItem(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
): CartItem[] {
  const cart = getCart();
  const addQty = item.quantity ?? 1;
  const idx = findMatchingIndex(cart, item);
  if (idx >= 0) {
    // Replace snapshot wholesale (name, image, weight_g, price, …) and merge
    // quantity. Keeps cart in sync with the latest product state on re-add.
    cart[idx] = { ...item, quantity: cart[idx].quantity + addQty };
  } else {
    cart.push({ ...item, quantity: addQty });
  }
  saveCart(cart);
  return cart;
}

/**
 * Locates a cart slot that should merge with the incoming item:
 *   1. exact variantId match (same DB row), or
 *   2. for non-mix items, same (productId + weight_g) but different variantId —
 *      that's a stale snapshot left over from a previous variant UUID
 *      (e.g. admin re-saved the product before the diff-based syncVariants
 *      fix was deployed). Treating it as the same logical variant lets the
 *      fresh add silently replace the stale entry instead of duplicating it.
 *   Mixes are skipped because each assembled mix is a genuinely unique variant.
 */
export function findMatchingIndex(
  cart: CartItem[],
  item: Pick<CartItem, "variantId" | "productId" | "weight_g" | "isMix">,
): number {
  const exact = cart.findIndex((c) => c.variantId === item.variantId);
  if (exact >= 0) return exact;
  if (item.isMix) return -1;
  return cart.findIndex(
    (c) =>
      !c.isMix &&
      c.productId === item.productId &&
      c.weight_g === item.weight_g,
  );
}

export function removeItem(variantId: string): CartItem[] {
  const cart = getCart().filter((c) => c.variantId !== variantId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(variantId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeItem(variantId);
  const cart = getCart();
  const item = cart.find((c) => c.variantId === variantId);
  if (item) item.quantity = quantity;
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_KEY);
}

export function getTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export interface CartTotals {
  /** Sum of (originalPrice ?? price) × qty — BEFORE any discount */
  originalSubtotal: number;
  /** Sum of price × qty — AFTER product promotions, BEFORE promo code */
  subtotal: number;
  /** Discount from active product promotions (originalPrice → price) */
  promotionDiscount: number;
  /** subtotal − promoDiscount */
  total: number;
}

export function getCartTotals(
  items: CartItem[],
  promoDiscount = 0,
): CartTotals {
  let originalSubtotal = 0;
  let subtotal = 0;
  for (const item of items) {
    const base = item.originalPrice ?? item.price;
    originalSubtotal += base * item.quantity;
    subtotal += item.price * item.quantity;
  }
  const promotionDiscount = originalSubtotal - subtotal;
  const total = Math.max(0, subtotal - promoDiscount);
  return { originalSubtotal, subtotal, promotionDiscount, total };
}

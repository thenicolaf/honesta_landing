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

function saveCart(items: CartItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addItem(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.variantId === item.variantId);
  if (existing) {
    existing.quantity += item.quantity ?? 1;
    existing.price = item.price;
    existing.originalPrice = item.originalPrice;
  } else {
    cart.push({ ...item, quantity: item.quantity ?? 1 });
  }
  saveCart(cart);
  return cart;
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

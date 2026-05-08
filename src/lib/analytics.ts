"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { CartItem, Product, ProductVariant } from "@/sections/products/types";

export interface GAItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
  item_category?: string;
}

export function cartItemToGAItem(item: CartItem): GAItem {
  return {
    item_id: item.productId,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_variant: `${item.weight_g}g`,
  };
}

export function productToGAItem(product: Product, variant?: ProductVariant): GAItem {
  const v = variant ?? product.variants?.[0];
  return {
    item_id: product.id ?? product.slug ?? product.title,
    item_name: product.title,
    price: v?.price ?? product.price ?? 0,
    quantity: 1,
    item_variant: v ? `${v.weight_g}g` : undefined,
    item_category: product.category,
  };
}

export function trackViewItemList(listName: string, items: GAItem[]) {
  sendGAEvent("event", "view_item_list", {
    item_list_name: listName,
    items,
  });
}

export function trackViewItem(item: GAItem) {
  sendGAEvent("event", "view_item", {
    currency: "AED",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: CartItem, addedQty: number) {
  const gaItem = { ...cartItemToGAItem(item), quantity: addedQty };
  sendGAEvent("event", "add_to_cart", {
    currency: "AED",
    value: gaItem.price * addedQty,
    items: [gaItem],
  });
}

export function trackRemoveFromCart(item: CartItem, removedQty: number) {
  const gaItem = { ...cartItemToGAItem(item), quantity: removedQty };
  sendGAEvent("event", "remove_from_cart", {
    currency: "AED",
    value: gaItem.price * removedQty,
    items: [gaItem],
  });
}

export function trackViewCart(items: CartItem[], value: number) {
  sendGAEvent("event", "view_cart", {
    currency: "AED",
    value,
    items: items.map(cartItemToGAItem),
  });
}

export function trackBeginCheckout(
  items: CartItem[],
  value: number,
  coupon?: string,
) {
  sendGAEvent("event", "begin_checkout", {
    currency: "AED",
    value,
    items: items.map(cartItemToGAItem),
    ...(coupon && { coupon }),
  });
}

export interface PurchasePayload {
  transactionId: string;
  value: number;
  items: GAItem[];
  coupon?: string;
}

export function trackPurchase(payload: PurchasePayload) {
  sendGAEvent("event", "purchase", {
    transaction_id: payload.transactionId,
    value: payload.value,
    currency: "AED",
    items: payload.items,
    ...(payload.coupon && { coupon: payload.coupon }),
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthMethod = "email" | "google";

export function trackSignUp(method: AuthMethod) {
  sendGAEvent("event", "sign_up", { method });
}

export function trackLogin(method: AuthMethod) {
  sendGAEvent("event", "login", { method });
}

// ─── Mix builder ──────────────────────────────────────────────────────────────

export interface MixAssemblePayload {
  boxId: string;
  boxName: string;
  presetCount: number;
  value: number;
  weightG: number;
}

export function trackMixAssemble(payload: MixAssemblePayload) {
  sendGAEvent("event", "mix_assemble", {
    currency: "AED",
    value: payload.value,
    box_id: payload.boxId,
    box_name: payload.boxName,
    preset_count: payload.presetCount,
    weight_g: payload.weightG,
  });
}

// ─── Wishlist (favorites) ─────────────────────────────────────────────────────

export interface WishlistMeta {
  name: string;
  price: number;
  category?: string;
}

function wishlistGAItem(productId: string, meta: WishlistMeta): GAItem {
  return {
    item_id: productId,
    item_name: meta.name,
    price: meta.price,
    item_category: meta.category,
  };
}

export function trackAddToWishlist(productId: string, meta: WishlistMeta) {
  sendGAEvent("event", "add_to_wishlist", {
    currency: "AED",
    value: meta.price,
    items: [wishlistGAItem(productId, meta)],
  });
}

export function trackRemoveFromWishlist(productId: string, meta: WishlistMeta) {
  sendGAEvent("event", "remove_from_wishlist", {
    currency: "AED",
    value: meta.price,
    items: [wishlistGAItem(productId, meta)],
  });
}

// ─── Partnership ──────────────────────────────────────────────────────────────

export function trackPartnershipInquiry(businessType?: string) {
  sendGAEvent("event", "partnership_inquiry", {
    ...(businessType && { business_type: businessType }),
  });
}

// ─── Promo codes ──────────────────────────────────────────────────────────────

export interface AppliedCouponPayload {
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  scope: "cart" | "product";
}

export function trackApplyCoupon(payload: AppliedCouponPayload) {
  sendGAEvent("event", "apply_coupon", {
    currency: "AED",
    coupon: payload.code,
    discount: payload.discount,
    discount_type: payload.discountType,
    scope: payload.scope,
  });
}

export function trackCouponInvalid(code: string, error: string) {
  sendGAEvent("event", "coupon_invalid", {
    coupon: code,
    error,
  });
}
